-- Para permitir que el estudiante vea en la lista `/unidades/:unidadId` todos los temas
-- como tarjetas (con candado si está bloqueado), esta migración relaja el RLS sobre `public.temas`.
-- Nota: el contenido detallado (actividades/evaluaciones/recursos) se protege a nivel de frontend
-- diferiendo la carga hasta que el prerequisito esté completado.

-- Quitar la política restrictiva anterior (por prerequisito) para permitir listado
DROP POLICY IF EXISTS "Estudiantes ven temas desbloqueados" ON public.temas;

-- Volver a permitir que cualquier autenticado vea temas (para que el listado muestre candados)
-- Docente/Admin ya tienen políticas propias de gestión/lectura, así que no se rompe el panel docente.
CREATE POLICY "Temas visibles para autenticados (listado candados)"
  ON public.temas
  FOR SELECT
  TO authenticated
  USING (true);

