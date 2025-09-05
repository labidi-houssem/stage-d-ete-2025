#!/bin/bash

echo "🔧 Fixing Next.js 15 API route parameter types..."

# Find all API route files with the old parameter type
find src/app/api -name "route.ts" -type f | while read file; do
    echo "Fixing $file..."
    
    # Replace the parameter type from { params: { ... } } to { params: Promise<{ ... }> }
    sed -i 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' "$file"
    
    # Add await for params usage in function bodies
    # This is a more complex replacement, so we'll do it step by step
    if grep -q "params\." "$file"; then
        # Add resolvedParams = await params after the session check
        sed -i '/const session = await getServerSession(authOptions);/a\    const resolvedParams = await params;' "$file"
        
        # Replace params. with resolvedParams. (but not in the function signature)
        sed -i 's/params\.\([a-zA-Z]*\)/resolvedParams.\1/g' "$file"
    fi
done

echo "✅ API route parameter types fixed!"
