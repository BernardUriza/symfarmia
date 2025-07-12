#!/bin/bash

echo "🔧 Arreglando API routes para Netlify..."

# Buscar todos los archivos route.js en app/api/
find app/api -name "route.js" -type f | while read -r file; do
    echo "📝 Procesando: $file"
    
    # Verificar si ya tiene la configuración
    if grep -q "export const dynamic" "$file"; then
        echo "✅ Ya configurado: $file"
        continue
    fi
    
    # Crear archivo temporal
    temp_file=$(mktemp)
    
    # Agregar configuración después de los imports
    {
        # Copiar imports
        grep -E "^import|^'use" "$file" || true
        
        # Agregar configuración de Netlify
        echo ""
        echo "// Configuración requerida para Netlify"
        echo "export const runtime = 'nodejs';"
        echo "export const dynamic = 'force-dynamic';"
        echo "export const revalidate = 0;"
        echo ""
        
        # Copiar resto del archivo (sin imports)
        grep -vE "^import|^'use" "$file" || true
        
    } > "$temp_file"
    
    # Reemplazar archivo original
    mv "$temp_file" "$file"
    
    echo "✅ Configurado: $file"
done

echo ""
echo "🎉 Todos los API routes han sido configurados para Netlify"
echo ""
echo "📋 Archivos modificados:"
find app/api -name "route.js" -type f | head -10

echo ""
echo "⚠️  Recuerda hacer commit de estos cambios:"
echo "git add app/api/"
echo "git commit -m 'fix: configure API routes for Netlify deployment'"