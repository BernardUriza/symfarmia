#!/bin/bash

# SYMFARMIA - Automated Netlify Deployment Script
# This script automates the deployment process to Netlify with environment selection

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="SYMFARMIA"
NETLIFY_SITE_NAME="symfarmia-app"

# Functions
print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}  $PROJECT_NAME Deployment Script${NC}"
    echo -e "${BLUE}=================================${NC}"
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

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi

    # Check npm version
    NPM_VERSION=$(npm --version | cut -d'.' -f1)
    if [ "$NPM_VERSION" -ne 9 ]; then
        print_error "npm version 9 is required. Current version: $(npm --version)"
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git and try again."
        exit 1
    fi
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI is not installed. Installing now..."
        npm install -g netlify-cli
        if [ $? -ne 0 ]; then
            print_error "Failed to install Netlify CLI. Please install manually: npm install -g netlify-cli"
            exit 1
        fi
    fi
    
    print_success "All prerequisites met!"
}

# Environment selection
select_environment() {
    echo ""
    print_step "Select deployment environment:"
    echo "1) Local/Development (uses .env.local)"
    echo "2) Production (uses Netlify environment variables)"
    echo "3) Exit"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-3): " choice
        case $choice in
            1)
                ENVIRONMENT="local"
                ENV_FILE=".env.local"
                print_success "Selected: Local/Development environment"
                break
                ;;
            2)
                ENVIRONMENT="production"
                ENV_FILE=""
                print_success "Selected: Production environment"
                break
                ;;
            3)
                print_step "Deployment cancelled by user."
                exit 0
                ;;
            *)
                print_warning "Invalid choice. Please enter 1, 2, or 3."
                ;;
        esac
    done
}

# Pre-deployment checks
pre_deployment_checks() {
    print_step "Running pre-deployment checks..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes:"
        git status --short
        echo ""
        read -p "Do you want to continue? (y/N): " continue_with_changes
        if [[ ! $continue_with_changes =~ ^[Yy]$ ]]; then
            print_step "Deployment cancelled. Please commit your changes and try again."
            exit 0
        fi
    fi
    
    # Check environment file for local deployment
    if [ "$ENVIRONMENT" = "local" ]; then
        if [ ! -f "$ENV_FILE" ]; then
            print_error "Environment file $ENV_FILE not found!"
            echo "Please create it based on .env.local.example"
            exit 1
        fi
        print_success "Environment file $ENV_FILE found."
    fi
    
    # Check for sensitive files that shouldn't be deployed
    SENSITIVE_FILES=(".env" ".env.local" ".env.production" "secrets.json" "keys.json")
    for file in "${SENSITIVE_FILES[@]}"; do
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            print_error "Sensitive file '$file' is tracked by git! This is a security risk."
            echo "Please remove it from git tracking: git rm --cached $file"
            exit 1
        fi
    done
    
    print_success "Pre-deployment checks passed!"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    npm ci
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies."
        exit 1
    fi
    print_success "Dependencies installed successfully!"
}

# Run linting and type checking
run_quality_checks() {
    print_step "Running code quality checks..."
    
    # Run linting
    print_step "Running ESLint..."
    npm run lint
    if [ $? -ne 0 ]; then
        print_error "Linting failed. Please fix the issues and try again."
        exit 1
    fi
    
    # Run type checking
    print_step "Running TypeScript type checking..."
    npm run type-check
    if [ $? -ne 0 ]; then
        print_error "Type checking failed. Please fix the issues and try again."
        exit 1
    fi
    
    print_success "Code quality checks passed!"
}

# Run tests
run_tests() {
    print_step "Running tests..."
    npm test
    if [ $? -ne 0 ]; then
        print_warning "Tests failed. Do you want to continue with deployment?"
        read -p "Continue? (y/N): " continue_with_test_failures
        if [[ ! $continue_with_test_failures =~ ^[Yy]$ ]]; then
            print_step "Deployment cancelled due to test failures."
            exit 0
        fi
    else
        print_success "All tests passed!"
    fi
}

# Build the application
build_application() {
    print_step "Building the application..."
    
    if [ "$ENVIRONMENT" = "local" ]; then
        # Copy local env file temporarily for build
        if [ -f "$ENV_FILE" ]; then
            cp "$ENV_FILE" .env.local.temp
            export NODE_ENV=production
        fi
    fi
    
    npm run build
    BUILD_EXIT_CODE=$?
    
    # Clean up temporary env file
    if [ -f ".env.local.temp" ]; then
        rm .env.local.temp
    fi
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        print_error "Build failed. Please fix the issues and try again."
        exit 1
    fi
    
    print_success "Application built successfully!"
}

# Deploy to Netlify
deploy_to_netlify() {
    print_step "Deploying to Netlify..."
    
    # Check if user is logged in to Netlify
    if ! netlify status >/dev/null 2>&1; then
        print_step "Please login to Netlify..."
        netlify login
        if [ $? -ne 0 ]; then
            print_error "Failed to login to Netlify."
            exit 1
        fi
    fi
    
    # Deploy based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        print_step "Deploying to production..."
        netlify deploy --prod --dir=.next --site=$NETLIFY_SITE_NAME
        DEPLOY_EXIT_CODE=$?
    else
        print_step "Deploying preview..."
        netlify deploy --dir=.next --site=$NETLIFY_SITE_NAME
        DEPLOY_EXIT_CODE=$?
    fi
    
    if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
        print_error "Deployment failed."
        exit 1
    fi
    
    print_success "Deployment completed successfully!"
}

# Post-deployment tasks
post_deployment() {
    print_step "Running post-deployment tasks..."
    
    # Get deployment URL
    if [ "$ENVIRONMENT" = "production" ]; then
        DEPLOY_URL=$(netlify status --site=$NETLIFY_SITE_NAME | grep "Website URL" | cut -d' ' -f3)
    else
        DEPLOY_URL=$(netlify status --site=$NETLIFY_SITE_NAME | grep "Deploy URL" | cut -d' ' -f3)
    fi
    
    echo ""
    print_success "=== DEPLOYMENT COMPLETE ==="
    echo -e "${GREEN}Environment:${NC} $ENVIRONMENT"
    echo -e "${GREEN}Site URL:${NC} $DEPLOY_URL"
    echo -e "${GREEN}Admin URL:${NC} https://app.netlify.com/sites/$NETLIFY_SITE_NAME"
    echo ""
    
    # Offer to open the deployed site
    read -p "Would you like to open the deployed site in your browser? (y/N): " open_site
    if [[ $open_site =~ ^[Yy]$ ]]; then
        if command -v open >/dev/null 2>&1; then
            open "$DEPLOY_URL"
        elif command -v xdg-open >/dev/null 2>&1; then
            xdg-open "$DEPLOY_URL"
        else
            print_step "Please open the following URL in your browser:"
            echo "$DEPLOY_URL"
        fi
    fi
}

# Main execution
main() {
    print_header
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    check_prerequisites
    select_environment
    pre_deployment_checks
    install_dependencies
    run_quality_checks
    run_tests
    build_application
    deploy_to_netlify
    post_deployment
    
    print_success "All done! 🚀"
}

# Run main function
main "$@"