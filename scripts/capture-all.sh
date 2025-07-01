#!/bin/bash

# SYMFARMIA - Complete Capture Script
# Captures both screenshots and PDFs of all app pages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NODE_MODULES="$PROJECT_ROOT/node_modules"

print_header() {
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}  SYMFARMIA - Complete Capture Tool${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if dev server is running
check_dev_server() {
    print_step "Checking if development server is running..."
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Development server is running!"
        return 0
    else
        print_warning "Development server is not running on localhost:3000"
        return 1
    fi
}

# Start dev server
start_dev_server() {
    print_step "Starting development server..."
    
    cd "$PROJECT_ROOT"
    
    # Start the server in background
    npm run dev > /dev/null 2>&1 &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Development server started (PID: $DEV_SERVER_PID)"
            return 0
        fi
        sleep 2
        echo "  Attempt $i/30..."
    done
    
    print_error "Failed to start development server"
    return 1
}

# Install puppeteer if not present
check_puppeteer() {
    print_step "Checking Puppeteer installation..."
    
    cd "$PROJECT_ROOT"
    
    if [ ! -d "$NODE_MODULES/puppeteer" ]; then
        print_warning "Puppeteer not found. Installing..."
        npm install puppeteer --save-dev
        if [ $? -ne 0 ]; then
            print_error "Failed to install Puppeteer"
            return 1
        fi
    fi
    
    print_success "Puppeteer is available!"
    return 0
}

# Capture screenshots
capture_screenshots() {
    print_step "Capturing screenshots..."
    
    cd "$PROJECT_ROOT"
    node scripts/screenshot-generator.js
    
    if [ $? -eq 0 ]; then
        print_success "Screenshots captured successfully!"
        return 0
    else
        print_error "Screenshot capture failed"
        return 1
    fi
}

# Export PDFs
export_pdfs() {
    print_step "Exporting PDFs..."
    
    cd "$PROJECT_ROOT"
    node scripts/pdf-exporter.js
    
    if [ $? -eq 0 ]; then
        print_success "PDFs exported successfully!"
        return 0
    else
        print_error "PDF export failed"
        return 1
    fi
}

# Create presentation package
create_presentation_package() {
    print_step "Creating presentation package..."
    
    cd "$PROJECT_ROOT"
    
    # Create presentation-assets directory
    PRESENTATION_DIR="presentation-assets"
    
    if [ -d "$PRESENTATION_DIR" ]; then
        rm -rf "$PRESENTATION_DIR"
    fi
    
    mkdir -p "$PRESENTATION_DIR"
    
    # Copy screenshots
    if [ -d "screenshots" ]; then
        cp -r screenshots "$PRESENTATION_DIR/"
        print_success "Screenshots copied to presentation package"
    fi
    
    # Copy PDFs  
    if [ -d "exports" ]; then
        cp -r exports "$PRESENTATION_DIR/"
        print_success "PDFs copied to presentation package"
    fi
    
    # Create README for presentation package
    cat > "$PRESENTATION_DIR/README.md" << EOF
# SYMFARMIA - Presentation Assets

This package contains all visual assets for presentations and investor materials.

## Contents

### Screenshots (/screenshots/)
- High-resolution PNG screenshots (1920x1080)
- Both desktop and mobile versions
- Includes screenshot report (HTML)

### PDFs (/exports/)
- Individual page PDFs
- Combined application overview PDF
- Print-ready format with headers/footers

## Usage

### For Presentations
- Use screenshots for slide decks
- Reference the screenshot report for organized viewing
- Use the combined PDF for comprehensive documentation

### For Investors
- Combined PDF provides complete application overview
- Individual PDFs allow focused feature discussions
- High-resolution screenshots perfect for pitch decks

## Files Generated
Generated on: $(date)
Total Screenshots: $(find screenshots -name "*.png" 2>/dev/null | wc -l)
Total PDFs: $(find exports -name "*.pdf" 2>/dev/null | wc -l)

## Technical Details
- Screenshots: 1920x1080 (desktop), 375x812 (mobile)
- PDFs: A4 format with professional headers/footers
- All assets are investor-ready and presentation-optimized
EOF
    
    # Create archive
    ARCHIVE_NAME="SYMFARMIA-Presentation-Assets-$(date +%Y%m%d-%H%M%S).zip"
    
    if command -v zip >/dev/null 2>&1; then
        zip -r "$ARCHIVE_NAME" "$PRESENTATION_DIR" > /dev/null 2>&1
        print_success "Presentation package archived: $ARCHIVE_NAME"
    else
        print_warning "zip not available, package created but not archived"
    fi
    
    print_success "Presentation package created: $PRESENTATION_DIR"
}

# Cleanup function
cleanup() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_step "Stopping development server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null || true
        print_success "Development server stopped"
    fi
}

# Main execution
main() {
    print_header
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    cd "$PROJECT_ROOT"
    
    # Check prerequisites
    check_puppeteer || exit 1
    
    # Check if server is running, start if not
    if ! check_dev_server; then
        start_dev_server || exit 1
        SERVER_STARTED_BY_SCRIPT=true
    fi
    
    # Wait a bit for server to be fully ready
    sleep 3
    
    # Capture screenshots
    SCREENSHOT_SUCCESS=false
    if capture_screenshots; then
        SCREENSHOT_SUCCESS=true
    fi
    
    # Export PDFs
    PDF_SUCCESS=false
    if export_pdfs; then
        PDF_SUCCESS=true
    fi
    
    # Create presentation package if either succeeded
    if [ "$SCREENSHOT_SUCCESS" = true ] || [ "$PDF_SUCCESS" = true ]; then
        create_presentation_package
    fi
    
    # Final summary
    echo ""
    print_success "=== CAPTURE COMPLETE ==="
    echo -e "${GREEN}Screenshots:${NC} $([ "$SCREENSHOT_SUCCESS" = true ] && echo "✅ Success" || echo "❌ Failed")"
    echo -e "${GREEN}PDFs:${NC} $([ "$PDF_SUCCESS" = true ] && echo "✅ Success" || echo "❌ Failed")"
    echo -e "${GREEN}Presentation Package:${NC} ✅ Created"
    echo ""
    
    if [ -d "presentation-assets" ]; then
        echo "📁 Assets available in: ./presentation-assets/"
        echo "📊 Screenshot Report: ./screenshots/screenshot-report.html"
        echo "📚 Combined PDF: ./exports/SYMFARMIA-Complete.pdf"
    fi
    
    print_success "All done! 🎉"
}

# Run main function
main "$@"