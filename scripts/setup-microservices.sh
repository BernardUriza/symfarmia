#!/bin/bash

# setup-microservices.sh - Script to setup SusurroTest microservice
# This script will clone, install dependencies, and configure the SusurroTest microservice

set -e  # Exit on error

echo "🚀 Starting SusurroTest Microservice Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    if [ -f /etc/debian_version ]; then
        OS="debian"
    elif [ -f /etc/redhat-release ]; then
        OS="redhat"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

echo "Detected OS: $OS"

# Function to install system dependencies
install_system_deps() {
    echo "Installing system dependencies..."
    
    case $OS in
        "debian")
            echo "Installing dependencies for Debian/Ubuntu..."
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y ffmpeg cmake build-essential
                print_success "System dependencies installed"
            else
                print_error "apt-get not found. Please install FFmpeg and CMake manually."
                exit 1
            fi
            ;;
        "redhat")
            echo "Installing dependencies for RedHat/CentOS..."
            if command -v yum &> /dev/null; then
                sudo yum install -y ffmpeg cmake gcc-c++
                print_success "System dependencies installed"
            else
                print_error "yum not found. Please install FFmpeg and CMake manually."
                exit 1
            fi
            ;;
        "macos")
            echo "Installing dependencies for macOS..."
            if command -v brew &> /dev/null; then
                brew install ffmpeg cmake
                print_success "System dependencies installed"
            else
                print_error "Homebrew not found. Please install Homebrew first: https://brew.sh"
                exit 1
            fi
            ;;
        "windows")
            print_warning "Windows detected. Please install FFmpeg and CMake manually:"
            echo "1. FFmpeg: https://www.gyan.dev/ffmpeg/builds/"
            echo "2. CMake: https://cmake.org/download/"
            echo "3. Add both to your PATH environment variable"
            read -p "Press Enter once you have installed the dependencies..."
            ;;
        *)
            print_warning "Unknown OS. Please install FFmpeg and CMake manually."
            ;;
    esac
}

# Check if dependencies are installed
check_dependencies() {
    local missing_deps=()
    
    if ! command -v ffmpeg &> /dev/null; then
        missing_deps+=("ffmpeg")
    fi
    
    if ! command -v cmake &> /dev/null; then
        missing_deps+=("cmake")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        
        if [[ " ${missing_deps[@]} " =~ " ffmpeg " ]] || [[ " ${missing_deps[@]} " =~ " cmake " ]]; then
            echo "Attempting to install system dependencies..."
            install_system_deps
        fi
        
        if [[ " ${missing_deps[@]} " =~ " node " ]] || [[ " ${missing_deps[@]} " =~ " npm " ]]; then
            print_error "Node.js and npm are required. Please install Node.js 18+ from https://nodejs.org/"
            exit 1
        fi
    else
        print_success "All system dependencies are installed"
    fi
}

# Main setup process
main() {
    # Get script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    MICROSERVICES_DIR="$PROJECT_ROOT/microservices"
    SUSURRO_DIR="$MICROSERVICES_DIR/susurro-test"
    
    echo "Project root: $PROJECT_ROOT"
    
    # Check dependencies
    check_dependencies
    
    # Create microservices directory if it doesn't exist
    if [ ! -d "$MICROSERVICES_DIR" ]; then
        echo "Creating microservices directory..."
        mkdir -p "$MICROSERVICES_DIR"
        print_success "Microservices directory created"
    fi
    
    # Clone repository if it doesn't exist
    if [ ! -d "$SUSURRO_DIR" ]; then
        echo "Cloning SusurroTest repository..."
        cd "$MICROSERVICES_DIR"
        git clone https://github.com/BernardUriza/susurrotest.git susurro-test
        print_success "Repository cloned"
    else
        print_warning "SusurroTest directory already exists. Skipping clone."
        
        # Pull latest changes
        echo "Pulling latest changes..."
        cd "$SUSURRO_DIR"
        git pull || print_warning "Could not pull latest changes. Continuing..."
    fi
    
    # Navigate to susurro directory
    cd "$SUSURRO_DIR"
    
    # Install npm dependencies
    echo "Installing npm dependencies..."
    npm install
    print_success "npm dependencies installed"
    
    # Run setup script if it exists
    if [ -f "$SUSURRO_DIR/package.json" ]; then
        # Check if setup script exists in package.json
        if grep -q '"setup"' "$SUSURRO_DIR/package.json"; then
            echo "Running SusurroTest setup..."
            npm run setup
            print_success "SusurroTest setup completed"
        fi
        
        # Check if download-model script exists
        if grep -q '"download-model"' "$SUSURRO_DIR/package.json"; then
            echo "Downloading Whisper model..."
            npm run download-model
            print_success "Whisper model downloaded"
        fi
        
        # Check if build-whisper script exists
        if grep -q '"build-whisper"' "$SUSURRO_DIR/package.json"; then
            echo "Building Whisper..."
            npm run build-whisper
            print_success "Whisper built successfully"
        fi
    fi
    
    # Check if port 3001 is available
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3001 is already in use. The microservice may not start properly."
        echo "You can stop the process using: lsof -ti:3001 | xargs kill -9"
    else
        print_success "Port 3001 is available"
    fi
    
    # Install concurrently in main project if not already installed
    cd "$PROJECT_ROOT"
    if ! npm list concurrently >/dev/null 2>&1; then
        echo "Installing concurrently in main project..."
        npm install --save-dev concurrently
        print_success "Concurrently installed"
    fi
    
    echo ""
    print_success "🎉 SusurroTest microservice setup completed!"
    echo ""
    echo "Available commands:"
    echo "  npm run dev:susurro      - Start only the SusurroTest microservice"
    echo "  npm run dev:all          - Start both Symfarmia and SusurroTest"
    echo "  npm run dev              - Start only Symfarmia"
    echo ""
    echo "The SusurroTest microservice will run on: http://localhost:3001"
    echo "The Symfarmia application will run on: http://localhost:3000"
}

# Run main function
main