#!/bin/bash

# ============================================================
# FiapMecanica - Automated Setup and Run Script
# ============================================================
# This script automates the installation and configuration
# of the Automotive Workshop Management System
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============================================================
# Helper Functions
# ============================================================

print_header() {
    echo -e "\n${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# ============================================================
# Check Prerequisites
# ============================================================

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local all_good=true
    
    # Check Node.js
    if check_command node; then
        NODE_VERSION=$(node --version)
        print_info "Node.js version: $NODE_VERSION"
    else
        print_error "Node.js is required. Please install Node.js 20+ from https://nodejs.org/"
        all_good=false
    fi
    
    # Check npm
    if check_command npm; then
        NPM_VERSION=$(npm --version)
        print_info "npm version: $NPM_VERSION"
    else
        print_error "npm is required"
        all_good=false
    fi
    
    # Check Docker
    if check_command docker; then
        DOCKER_VERSION=$(docker --version)
        print_info "Docker version: $DOCKER_VERSION"
    else
        print_warning "Docker is not installed. You can still run in local mode."
    fi
    
    # Check Docker Compose
    set +e  # Temporarily disable exit on error
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
        COMPOSE_VERSION=$(docker-compose --version 2>&1)
        print_info "Docker Compose version: $COMPOSE_VERSION"
    elif docker compose version &> /dev/null; then
        print_success "Docker Compose is installed"
        COMPOSE_VERSION=$(docker compose version 2>&1)
        print_info "Docker Compose version: $COMPOSE_VERSION"
    else
        print_warning "Docker Compose is not installed. You can still run in local mode."
    fi
    set -e  # Re-enable exit on error
    
    if [ "$all_good" = false ]; then
        print_error "Some prerequisites are missing. Please install them and try again."
        exit 1
    fi
    
    print_success "All required prerequisites are met!"
}

# ============================================================
# Create Environment File
# ============================================================

create_env_file() {
    print_header "Setting Up Environment Variables"
    
    if [ -f ".env" ]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing .env file"
            return
        fi
    fi
    
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://workshop:workshop123@localhost:5432/workshop_db?schema=public"

# Application Configuration
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="24h"
EOF
    
    print_success ".env file created successfully"
}

# ============================================================
# Install Dependencies
# ============================================================

install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ -d "node_modules" ]; then
        print_warning "node_modules already exists"
        read -p "Do you want to reinstall dependencies? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Removing existing node_modules..."
            rm -rf node_modules package-lock.json
        else
            print_info "Skipping dependency installation"
            return
        fi
    fi
    
    print_info "Installing npm packages... (this may take a few minutes)"
    npm install
    
    print_success "Dependencies installed successfully"
}

# ============================================================
# Setup Database
# ============================================================

setup_database() {
    print_header "Setting Up Database"
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required for database setup"
        print_info "Please install Docker or set up PostgreSQL manually"
        return 1
    fi
    
    # Start PostgreSQL container
    print_info "Starting PostgreSQL database..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d postgres
    else
        docker compose up -d postgres
    fi
    
    print_info "Waiting for database to be ready..."
    sleep 5
    
    # Check if database is ready
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker exec workshop-db pg_isready -U workshop &> /dev/null; then
            print_success "Database is ready!"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    echo
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Database failed to start in time"
        return 1
    fi
    
    print_success "Database setup completed"
}

# ============================================================
# Run Migrations
# ============================================================

run_migrations() {
    print_header "Running Database Migrations"
    
    print_info "Generating Prisma client..."
    npm run prisma:generate
    
    print_info "Running migrations..."
    npm run prisma:migrate
    
    print_success "Migrations completed successfully"
}

# ============================================================
# Seed Database
# ============================================================

seed_database() {
    print_header "Seeding Database (Optional)"
    
    read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."
        npm run prisma:seed
        print_success "Database seeded successfully"
    else
        print_info "Skipping database seeding"
    fi
}

# ============================================================
# Build Application
# ============================================================

build_application() {
    print_header "Building Application"
    
    print_info "Compiling TypeScript..."
    npm run build
    
    print_success "Application built successfully"
}

# ============================================================
# Display Information
# ============================================================

display_info() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}Your Automotive Workshop Management System is ready!${NC}\n"
    
    echo -e "${BLUE}Available Commands:${NC}"
    echo -e "  ${YELLOW}npm run start:dev${NC}     - Start in development mode (with hot-reload)"
    echo -e "  ${YELLOW}npm run start:prod${NC}    - Start in production mode"
    echo -e "  ${YELLOW}npm run test${NC}          - Run tests"
    echo -e "  ${YELLOW}npm run prisma:studio${NC} - Open Prisma Studio (database GUI)"
    echo -e ""
    
    echo -e "${BLUE}Access Points:${NC}"
    echo -e "  API:           ${YELLOW}http://localhost:3000/api/v1${NC}"
    echo -e "  Swagger Docs:  ${YELLOW}http://localhost:3000/api/docs${NC}"
    echo -e "  Database:      ${YELLOW}localhost:5432${NC}"
    echo -e "    - User:      ${YELLOW}workshop${NC}"
    echo -e "    - Password:  ${YELLOW}workshop123${NC}"
    echo -e "    - Database:  ${YELLOW}workshop_db${NC}"
    echo -e ""
    
    echo -e "${BLUE}Docker Commands:${NC}"
    echo -e "  ${YELLOW}docker-compose up -d${NC}       - Start all services"
    echo -e "  ${YELLOW}docker-compose down${NC}        - Stop all services"
    echo -e "  ${YELLOW}docker-compose logs -f app${NC} - View application logs"
    echo -e ""
}

# ============================================================
# Start Application
# ============================================================

start_application() {
    print_header "Starting Application"
    
    echo -e "${BLUE}How do you want to run the application?${NC}"
    echo -e "  ${YELLOW}1${NC} - Development mode (with hot-reload)"
    echo -e "  ${YELLOW}2${NC} - Production mode"
    echo -e "  ${YELLOW}3${NC} - Skip for now"
    echo -e ""
    read -p "Select option (1-3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            print_info "Starting in development mode..."
            npm run start:dev
            ;;
        2)
            print_info "Starting in production mode..."
            npm run start:prod
            ;;
        3)
            print_info "You can start the application later using 'npm run start:dev'"
            ;;
        *)
            print_warning "Invalid option. You can start the application later using 'npm run start:dev'"
            ;;
    esac
}

# ============================================================
# Main Execution
# ============================================================

main() {
    clear
    
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║   🚗  Automotive Workshop Management System  🚗          ║"
    echo "║                                                          ║"
    echo "║            Automated Setup & Configuration              ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Create environment file
    create_env_file
    
    # Step 3: Install dependencies
    install_dependencies
    
    # Step 4: Setup database
    setup_database
    
    # Step 5: Run migrations
    run_migrations
    
    # Step 6: Seed database (optional)
    seed_database
    
    # Step 7: Build application
    build_application
    
    # Step 8: Display information
    display_info
    
    # Step 9: Start application (optional)
    start_application
}

# Run main function
main
