# Analisis de Normalizacion y Uso del Dashboard

## Resumen

El dashboard no consulta directamente la mayoria de las tablas ni vistas. La app usa una capa de funciones RPC en Supabase (`fn_dashboard_*`) que devuelve datos ya agregados al frontend.

Las tablas consultadas directamente desde el codigo son principalmente:

- `partners`
- `dashboard_users`

El resto del dashboard depende de funciones SQL/RPC, por lo que el uso real de tablas como `lead_facts`, `lead_events`, `lp_leads_raw` o vistas internas queda encapsulado dentro de esas funciones.

## Uso Por Pantalla

### Dashboard Principal `/`

Archivo principal: `app/page.tsx`

Usa:

| UI | Endpoint frontend | Supabase |
| --- | --- | --- |
| Perfil de usuario | server page | `fn_my_profile()` |
| Filtros | `/api/filter-options` | `partners`, `fn_get_min_event_day()`, `fn_get_distinct_verticals()` |
| KPIs | `/api/kpis` | `fn_dashboard_kpis(...)` |
| Metricas financieras | `/api/financials` | `fn_dashboard_financials(...)` |
| Tendencias | `/api/trends` | `fn_dashboard_trends(...)` |
| Ranking suppliers | `/api/suppliers` | `fn_dashboard_suppliers(...)` |
| Ranking buyers | `/api/buyers` | `fn_dashboard_buyers(...)` |
| Mapa geografico | `/api/geo` | `fn_dashboard_geo(...)` |

Componentes relevantes:

- `components/dashboard-client.tsx`
- `components/kpi-gauges.tsx`
- `components/financial-scorecards.tsx`
- `components/trend-chart.tsx`
- `components/supplier-table.tsx`
- `components/buyer-table.tsx`
- `components/geo-map.tsx`
- `components/filter-bar.tsx`

### Pagina de Leads `/leads`

Archivos:

- `app/leads/page.tsx`
- `components/leads-client.tsx`
- `components/leads-table.tsx`

Usa:

| UI | Endpoint frontend | Supabase |
| --- | --- | --- |
| Perfil de usuario | server page | `fn_my_profile()` |
| Filtros | `/api/filter-options` | `partners`, `fn_get_min_event_day()`, `fn_get_distinct_verticals()` |
| Tabla de leads | `/api/leads` | `fn_dashboard_leads(...)` |

### Admin `/admin`

Archivos:

- `app/admin/page.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/route.ts`

Usa:

| UI | Supabase |
| --- | --- |
| Validar perfil/admin | `fn_my_profile()` |
| Lista de suppliers para asignar usuarios | `partners` |
| CRUD perfiles de dashboard | `dashboard_users` |
| Join visual de usuario con partner | `dashboard_users` + `partners(name)` |

## Tablas Usadas Directamente Por La App

| Tabla | Uso |
| --- | --- |
| `partners` | Opciones de filtros supplier/buyer y asignacion de suppliers en admin |
| `dashboard_users` | Crear, listar y actualizar usuarios del dashboard |

## Funciones RPC Usadas Directamente Por La App

| Funcion | Endpoint/pantalla |
| --- | --- |
| `fn_my_profile()` | Autenticacion/autorizacion y header |
| `fn_get_min_event_day()` | Rango minimo de fechas del filtro |
| `fn_get_distinct_verticals()` | Opciones de verticales |
| `fn_dashboard_kpis(...)` | KPIs |
| `fn_dashboard_financials(...)` | Finanzas |
| `fn_dashboard_trends(...)` | Tendencias |
| `fn_dashboard_suppliers(...)` | Ranking suppliers |
| `fn_dashboard_buyers(...)` | Ranking buyers |
| `fn_dashboard_geo(...)` | Mapa |
| `fn_dashboard_leads(...)` | Tabla de leads |

## Vistas Expuestas En El Esquema

Estas vistas aparecen expuestas por Supabase/PostgREST:

- `v_leads_summary`
- `v_leads_by_buyer`
- `v_leads_by_state`
- `v_leads_hourly`
- `v_metrics_monthly_buyer`
- `vw_metrics_by_vertical`
- `vw_internal_lead_report`

En el codigo frontend/API actual no hay llamadas directas a esas vistas. Pueden estar siendo usadas internamente por funciones RPC, pero eso no se puede confirmar desde el codigo de la app porque el SQL de las funciones no esta versionado en el repo.

## Analisis De Normalizacion

### Bien Normalizado

| Area | Evaluacion |
| --- | --- |
| Partners | `partners` centraliza suppliers/buyers en una sola entidad con `partner_type`. Esto evita duplicar catalogos. |
| Usuarios | `dashboard_users` separa perfil del usuario Auth. Es correcto para roles y atributos de negocio. |
| Usuario-partner | `user_partners` permite relacion many-to-many, aunque la app hoy parece usar principalmente `dashboard_users.partner_id`. |
| Campanas LP | `lp_campaigns` separa catalogo de campanas y permite sync incremental por `last_synced_at`. |
| Identidad de lead | `lead_identity` separa normalizacion de phone/email, util para deduplicacion. |
| Eventos | `lead_events` modela eventos como hechos de tiempo, fuente, buyer/supplier y estado. |

### Parcialmente Desnormalizado A Proposito

| Tabla | Motivo |
| --- | --- |
| `lead_facts` | Parece una tabla fact/materializada para dashboard. Duplica nombres y IDs de supplier/buyer para acelerar consultas y simplificar agregaciones. |
| `lp_leads_raw` | Guarda datos crudos y payload JSON. Es normal en capas de ingesta/staging, aunque no busca 3NF estricta. |
| `buyer_reports` | Mezcla payload crudo con campos procesados. Funciona como staging/reporting importado. |
| Vistas `v_*`/`vw_*` | Son proyecciones agregadas/read models, no tablas normalizadas. |

### Problemas O Riesgos De Normalizacion

| Riesgo | Donde | Impacto |
| --- | --- | --- |
| FK logicas no declaradas | `lead_facts.supplier_id`, `lead_facts.buyer_id` hacia `partners.id` | Riesgo de IDs huerfanos y dbdiagram sin relaciones visibles |
| Campana sin FK explicita | `lp_leads_raw.campaign_id` hacia `lp_campaigns.lp_campaign_id` | Riesgo de leads vinculados a campanas inexistentes |
| Doble modelo de permisos | `dashboard_users.partner_id` y `user_partners` | Puede generar ambiguedad: usuario con un partner directo vs varios partners |
| Nombres duplicados | `lead_facts.supplier`, `lead_facts.buyer`, `lp_leads_raw.buyer_name` | Si cambia un nombre en `partners`, los hechos historicos pueden quedar inconsistentes |
| Estados en texto libre | `status_bucket`, `status_raw`, `disposition`, `partner_type`, `status` | Sin check constraints/catalogos, pueden aparecer variantes inconsistentes |
| Vistas sin linaje documentado | `v_*`, `vw_*` | Dificulta saber que tabla alimenta cada metrica |

## Recomendaciones

1. Declarar FK reales si los datos lo permiten:
   - `lead_facts.supplier_id -> partners.id`
   - `lead_facts.buyer_id -> partners.id`
   - `lp_leads_raw.campaign_id -> lp_campaigns.lp_campaign_id`

2. Decidir un solo modelo de permisos:
   - Si cada usuario supplier tiene un solo partner: mantener `dashboard_users.partner_id` y retirar/no usar `user_partners`.
   - Si puede tener multiples partners: usar `user_partners` y eliminar la dependencia funcional de `dashboard_users.partner_id`.

3. Crear constraints o catalogos para valores cerrados:
   - `partners.partner_type`
   - `partners.status`
   - `dashboard_users.role`
   - `lead_facts.status_bucket`
   - `lead_facts.disposition`

4. Versionar el SQL de funciones y vistas:
   - `fn_dashboard_*`
   - `fn_my_profile`
   - `v_*`
   - `vw_*`

5. Separar claramente capas:
   - Staging/raw: `lp_leads_raw`, `buyer_reports`
   - Core normalizado: `partners`, `lp_campaigns`, `lead_identity`, `lead_events`
   - Read model/dashboard: `lead_facts`, vistas y funciones RPC

## Conclusiones

La base no esta mal modelada: combina una capa raw, una capa core y una capa de reporting. Eso es razonable para un dashboard analitico.

El punto debil no es la falta de normalizacion pura, sino la falta de constraints/documentacion en relaciones logicas y la dependencia de funciones RPC cuyo SQL no esta versionado en el repo. Para claridad operativa, conviene declarar FKs donde sea posible y documentar o versionar las funciones/vistas que alimentan las metricas.
