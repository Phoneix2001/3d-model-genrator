export const Prompt = (description: string | null): string => 
`1. Generate only the Blender Python script code (no explanations, no comments, no code block markers).

2. Always include at the top:

import bpy
import requests
import os

3. Define exactly one function named create_scene() that:

 - Switches out of Edit mode if needed.

 - Uses these fixed names:

    Object: "MainObject"

    Mesh: "MainMesh"

    Material: "MainMaterial"

 - Deletes any existing object, mesh, or material with those names before creating new ones.

 - Creates the geometry described in: "${description}".

 - Returns the created obj.

4. After the function, include only this call:

obj = create_scene()

5. Do not include the render function, any other functions, or any extra code.

6. Output strictly the Python code.`.trim();


export const ValidatePrompt = (description: string | null, code: string): string => 
   `You have been given the following task description:
   
   "${description}"
   
   And the following Python code generated for it:
   
   ${code}
   
   Your job is to:
   
   1. Check if the code strictly follows **all the following rules**:
      - Only Blender Python script code (no explanations, no comments, no code block markers).
      - Starts with:
      
        import bpy
        import requests
        import os
        
      - Contains exactly **one** function called create_scene().
      - Inside create_scene():
        - Switches out of Edit mode if necessary.
        - Uses only these fixed names:
          
            Object: "MainObject"
            Mesh: "MainMesh"
            Material: "MainMaterial"
          
        - Deletes any existing object, mesh, or material with those names before creating new ones.
        - Creates the geometry as described.
        - Returns the created object.
      - After the function, includes only:
        
        obj = create_scene()
      
      - No render function, no other functions, no extra code.
   
   2. If the provided code **fully satisfies** these rules, return the same code **as-is**.
   
   3. If the code **does not satisfy** the rules, correct it and return the fixed code.
   
   ⚠ IMPORTANT: Your output must **only** be the corrected Python code (no explanations, no comments, no extra text), strictly following the above rules.`.trim();
   