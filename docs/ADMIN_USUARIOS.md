# Administración de usuarios

## Alta actual (panel Admin)

El panel `/admin` usa `supabase.auth.signUp()` desde el cliente con la anon key. Limitaciones:

- Puede requerir confirmación de email según la configuración de Auth.
- Límites de rate limit de Supabase en entornos gratuitos.

## Recomendación producción

Para colegios con muchos alumnos, migrar a una **Edge Function** con service role que:

1. Cree el usuario en Auth sin confirmación manual.
2. Inserte el perfil en `profiles` (solo admin según RLS).
3. Devuelva éxito/error al panel admin.

Mientras tanto, desactiva **Enable email confirmations** en Supabase Auth si los docentes/administradores dan de alta cuentas.

## Contraseñas olvidadas

No hay flujo self-service. El administrador debe restablecer la contraseña desde **Supabase → Authentication → Users** o contactar soporte interno del colegio.
