#!/bin/bash

############################################################
# Logstash Setup Script
# This script installs and configures Logstash on a server
# Supports Ubuntu/Debian and CentOS/RHEL systems
############################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "Cannot detect OS"
        exit 1
    fi
    log_info "Detected OS: $OS $VERSION"
}

# Install Java (required for Logstash)
install_java() {
    log_info "Checking for Java installation..."
    
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
        log_info "Java is already installed: $JAVA_VERSION"
    else
        log_info "Installing Java..."
        case $OS in
            ubuntu|debian)
                apt-get update
                apt-get install -y openjdk-11-jdk
                ;;
            centos|rhel)
                yum install -y java-11-openjdk java-11-openjdk-devel
                ;;
            *)
                log_error "Unsupported OS for automatic Java installation"
                exit 1
                ;;
        esac
        log_info "Java installed successfully"
    fi
}

# Install Logstash
install_logstash() {
    log_info "Installing Logstash..."
    
    case $OS in
        ubuntu|debian)
            # Import Elastic GPG key
            wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
            
            # Add Elastic repository
            echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | \
                tee /etc/apt/sources.list.d/elastic-8.x.list
            
            # Update and install
            apt-get update
            apt-get install -y logstash
            ;;
        centos|rhel)
            # Import Elastic GPG key
            rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
            
            # Add Elastic repository
            cat > /etc/yum.repos.d/logstash.repo <<EOF
[logstash-8.x]
name=Elastic repository for 8.x packages
baseurl=https://artifacts.elastic.co/packages/8.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF
            
            # Install
            yum install -y logstash
            ;;
        *)
            log_error "Unsupported OS for Logstash installation"
            exit 1
            ;;
    esac
    
    log_info "Logstash installed successfully"
}

# Configure Logstash
configure_logstash() {
    log_info "Configuring Logstash..."
    
    # Create configuration directory if it doesn't exist
    mkdir -p /etc/logstash/conf.d
    
    # Copy configuration file (assumes logstash.conf is in the same directory)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    if [ -f "$SCRIPT_DIR/logstash.conf" ]; then
        cp "$SCRIPT_DIR/logstash.conf" /etc/logstash/conf.d/api-logs.conf
        log_info "Logstash configuration file copied"
    else
        log_warn "logstash.conf not found in $SCRIPT_DIR"
        log_info "Creating basic configuration..."
        
        cat > /etc/logstash/conf.d/api-logs.conf <<'EOF'
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  # Add any filtering logic here
  mutate {
    add_field => { "[@metadata][beat]" => "api" }
  }
}

output {
  # Output to file for debugging
  file {
    path => "/var/log/logstash/api-logs-%{+YYYY-MM-dd}.log"
    codec => json_lines
  }
  
  # Output to console for debugging (can be disabled in production)
  stdout {
    codec => rubydebug
  }
  
  # Uncomment below to output to Elasticsearch
  # elasticsearch {
  #   hosts => ["localhost:9200"]
  #   index => "api-logs-%{+YYYY.MM.dd}"
  # }
}
EOF
        log_info "Basic configuration created"
    fi
    
    # Create log directory
    mkdir -p /var/log/logstash
    chown logstash:logstash /var/log/logstash
    
    # Set permissions
    chown -R logstash:logstash /etc/logstash
    
    log_info "Logstash configuration completed"
}

# Enable and start Logstash service
start_logstash() {
    log_info "Starting Logstash service..."
    
    # Enable service to start on boot
    systemctl enable logstash
    
    # Start service
    systemctl start logstash
    
    # Check status
    if systemctl is-active --quiet logstash; then
        log_info "Logstash is running successfully"
    else
        log_error "Failed to start Logstash"
        log_info "Check logs with: journalctl -u logstash -f"
        exit 1
    fi
}

# Configure firewall (if applicable)
configure_firewall() {
    log_info "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian firewall
        ufw allow 5000/tcp
        log_info "Firewall configured (ufw)"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL firewall
        firewall-cmd --permanent --add-port=5000/tcp
        firewall-cmd --reload
        log_info "Firewall configured (firewalld)"
    else
        log_warn "No firewall detected or supported"
    fi
}

# Main execution
main() {
    log_info "========================================="
    log_info "  Logstash Installation and Setup"
    log_info "========================================="
    
    detect_os
    install_java
    install_logstash
    configure_logstash
    start_logstash
    configure_firewall
    
    log_info "========================================="
    log_info "  Logstash setup completed successfully!"
    log_info "========================================="
    log_info "Logstash is listening on port 5000"
    log_info "View logs with: journalctl -u logstash -f"
    log_info "Check status with: systemctl status logstash"
}

# Run main function
main
