#!/bin/zsh

# Fix exercise pages that have issues with the ExerciseIconsPanel import
echo "Starting fix for exercise pages..."

cd "$(dirname "$0")/.."
WORKSPACE_ROOT=$(pwd)

# Fix import statement formatting issues
echo "Fixing import statements..."
find "$WORKSPACE_ROOT/app/exercise" -name "page.jsx" -exec grep -l "ExerciseIconsPanel.*import" {} \; | while read -r file; do
  echo "Fixing import in $file"
  sed -i '' 's/ExerciseIconsPanel.*import/ExerciseIconsPanel\nimport/g' "$file"
done

# Fix missing ExerciseIconsPanel component implementation
echo "Fixing component implementation..."
find "$WORKSPACE_ROOT/app/exercise" -name "page.jsx" -exec grep -l "cursor-pointer fixed bottom-12 left-5" {} \; | while read -r file; do
  echo "Updating component in $file"
  
  # Extract variables from file for use in the replacement
  has_row=$(grep -c "row\s*=" "$file")
  has_col=$(grep -c "col\s*=" "$file")
  has_background=$(grep -c "backgroundColor\s*=" "$file")
  has_init_colors=$(grep -c "initShapeColors\s*=" "$file")
  
  # Create the component replacement with appropriate variables
  sed -i '' 's/<div[[:space:]]*onClick={instructionModalOpen}[[:space:]]*className=['\''"][^>]*bottom-12 left-5['\''"][[:space:]]*>\s*<img[^>]*info\.svg[^>]*>\s*<\/div>/<ExerciseIconsPanel\n                        onInstructionOpen={instructionModalOpen}\n                        shapeColors={initShapeColors || \[\]}\n                        backgroundColor={backgroundColor || '\''rgb(255,255,255)'\''}\n                        row={row || 1}\n                        col={col || 1}\n                    \/>/' "$file"
done

echo "All exercise pages have been fixed!"
