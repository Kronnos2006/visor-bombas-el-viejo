// Genera SQL de fixture SOLO para el proyecto temporal. No ejecuta consultas.
// Redirigir a un archivo privado y aplicarlo exclusivamente en rbiuaucawhmiqvqomqec.
import {readFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(process.env.VOCATUS_QA_CREDENTIALS,'utf8'));
if(data.projectRef!=='rbiuaucawhmiqvqomqec')throw Error('Proyecto de prueba incorrecto');
const u=data.users.editor,claims=JSON.parse(Buffer.from(data.sessions.editor.access_token.split('.')[1],'base64url'));
for(const value of [u.id,claims.session_id])if(!/^[0-9a-f-]{36}$/.test(value))throw Error('Fixture UUID inválido');
if(!Number.isSafeInteger(claims.iat))throw Error('Fixture iat inválido');
console.log(`begin;
do $$ begin
 if exists(select 1 from auth.users where email not like '%@vocatus-tests.invalid') then
  raise exception 'La base no es exclusivamente sintética';
 end if;
end $$;
update vocatus_access.accounts a set revoked_before=s.created_at-interval '1 microsecond'
from auth.sessions s where a.id='${u.id}' and s.id='${claims.session_id}' and s.user_id=a.id;
do $$ begin
 if not exists(select 1 from vocatus_access.accounts a join auth.sessions s on s.user_id=a.id
 where a.id='${u.id}' and s.id='${claims.session_id}'
 and date_trunc('second',s.created_at)=date_trunc('second',a.revoked_before)
 and s.created_at>a.revoked_before and to_timestamp(${claims.iat})<=a.revoked_before) then
  raise exception 'El fixture no reproduce el límite del mismo segundo';
 end if;
end $$;
commit;
-- Después, ejecutar vocatus_account por HTTP con la sesión firmada REAL del editor.
-- sessionValid debe ser true. El runner run-isolated.mjs hace esa comprobación.
`);
