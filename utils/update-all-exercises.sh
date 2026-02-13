#!/bin/zsh

# Update exercises in each section with ExerciseIconsPanel component
echo "Starting exercise page updates..."

cd "$(dirname "$0")/.."
WORKSPACE_ROOT=$(pwd)
SECTIONS=("section2" "section3" "section4" "sectionX")

# Check if find and sed are available
if ! command -v find >/dev/null 2>&1 || ! command -v sed >/dev/null 2>&1; then
  echo "Error: This script requires find and sed commands"
  exit 1
fi

# Function to update a single exercise page
update_exercise_page() {
  local file=$1
  echo "Updating $file"
  
  # Add the import statement if not already present
  if ! grep -q "import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'" "$file"; then
    sed -i '' '/import.*CustomText/a\
import ExerciseIconsPanel from '\''@/components/ExerciseIconsPanel'\''' "$file"
  fi
  
  # Replace the info icon div with ExerciseIconsPanel component
  sed -i '' 's/<div[^>]*onClick={instructionModalOpen}[^>]*className=['\''"][^>]*bottom-12 left-5['\''"][^>]*>.*<img[^>]*info\.svg[^>]*>.*<\/div>/<ExerciseIconsPanel\
                        onInstructionOpen={instructionModalOpen}\
                        shapeColors={initShapeColors || \[\]}\
                        backgroundColor={backgroundColor || '\''rgb(255,255,255)'\''}\
                        row={row || 1}\
                        col={col || 1}\
                    \/>/' "$file"
}

# Process each section
for section in "${SECTIONS[@]}"; do
  echo "Updating $section exercises..."
  section_path="$WORKSPACE_ROOT/app/exercise/$section"
  
  if [ -d "$section_path" ]; then
    # Find all page.jsx files in the section
    find "$section_path" -name "page.jsx" | while read -r file; do
      update_exercise_page "$file"
    done
  else
    echo "Warning: Section directory not found: $section_path"
  fi
done

echo "All exercise pages have been updated!"
