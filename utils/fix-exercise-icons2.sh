#!/bin/zsh

# Fix the icon component in all exercise pages
WORKSPACE_ROOT=$(cd "$(dirname "$0")/.." && pwd)

# Function to update a page
update_page() {
  local file="$1"
  local filename=$(basename "$file")
  local dir=$(dirname "$file")
  local section=$(basename "$(dirname "$dir")")
  
  echo "Processing $section/$filename..."
  
  # Check if import statement needs to be fixed first
  if grep -q "ExerciseIconsPanel.*import" "$file"; then
    sed -i '' 's/ExerciseIconsPanel.*import/ExerciseIconsPanel\nimport/g' "$file"
  elif ! grep -q "import ExerciseIconsPanel" "$file"; then
    # Add import if it doesn't exist
    sed -i '' '/import.*CustomText/a\\
import ExerciseIconsPanel from '\''@/components/ExerciseIconsPanel'\''' "$file"
  fi
  
  # Now update the info icon div with the ExerciseIconsPanel component
  # Create a temporary file for the transformation
  local tmp_file=$(mktemp)
  
  awk '
  {
    if ($0 ~ /onClick={instructionModalOpen}/ && $0 ~ /bottom-12 left-5/) {
      # Found the start line of the div
      print "                    <ExerciseIconsPanel"
      print "                        onInstructionOpen={instructionModalOpen}"
      print "                        shapeColors={initShapeColors || []}"
      print "                        backgroundColor={backgroundColor || \"rgb(255,255,255)\"}"
      print "                        row={row || 1}"
      print "                        col={col || 1}"
      print "                    />"
      
      # Skip lines until we find the closing div
      skip = 1
    } else if (skip == 1) {
      if ($0 ~ /<\/div>/) {
        skip = 0
      }
    } else {
      print $0
    }
  }
  ' "$file" > "$tmp_file"
  
  # Replace the original file with our modified version
  mv "$tmp_file" "$file"
}

# Find all page.jsx files and process them
find "$WORKSPACE_ROOT/app/exercise" -name "page.jsx" | while read -r file; do
  update_page "$file"
done

echo "All exercise pages have been updated!"
