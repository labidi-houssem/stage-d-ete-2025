#!/bin/bash

# Test deployment script - validates setup before actual deployment

set -e

echo "🧪 Testing deployment setup..."

# Check if required files exist
echo "📁 Checking required files..."
required_files=(
    "docker-compose.prod.yml"
    "Dockerfile.prod"
    "nginx.prod.conf"
    "deploy-to-server.sh"
    "setup-server.sh"
    ".env"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Check if scripts are executable
echo "🔧 Checking script permissions..."
scripts=("deploy-to-server.sh" "setup-server.sh" ".git/hooks/post-commit")

for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        echo "✅ $script is executable"
    else
        echo "❌ $script is not executable"
        exit 1
    fi
done

# Check environment variables
echo "🌍 Checking environment variables..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    # Check for required variables
    required_vars=("DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            echo "✅ $var is set"
        else
            echo "⚠️  $var is not set in .env"
        fi
    done
else
    echo "❌ .env file not found"
    exit 1
fi

# Test Docker build locally
echo "🐳 Testing Docker build..."
if command -v docker &> /dev/null; then
    if docker build -f Dockerfile.prod -t test-build . > /dev/null 2>&1; then
        echo "✅ Docker build successful"
        docker rmi test-build > /dev/null 2>&1
    else
        echo "❌ Docker build failed"
        echo "   Run: docker build -f Dockerfile.prod -t test-build ."
        echo "   to see detailed error messages"
        exit 1
    fi
else
    echo "⚠️  Docker not installed locally - skipping build test"
    echo "   Install Docker with: sudo apt install docker.io"
fi

echo "🎉 All tests passed! Ready for deployment."
echo ""
echo "📝 Next steps:"
echo "   1. Run: ssh houssem@104.248.134.98 'bash -s' < setup-server.sh"
echo "   2. Update .env on server with production values"
echo "   3. Run: ./deploy-to-server.sh"
echo "   4. Your app will be available at: http://104.248.134.98"
