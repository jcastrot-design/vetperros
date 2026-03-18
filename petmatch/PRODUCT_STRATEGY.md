# PetMatch — Documento de Producto Estratégico
## Super-App de Mascotas para LATAM

**Fecha:** Marzo 2026
**Versión:** 1.0
**Equipo:** Product Strategist · Founder · UX Lead · Marketplace Expert · Veterinarian Product Advisor · Growth Lead · CTO

---

# 1. RESUMEN EJECUTIVO

## 1.1 Oportunidad de negocio

El mercado pet en Latinoamérica crece al 12-15% anual. Solo en México supera los USD 4.000M, en Brasil USD 9.000M y en Chile USD 1.200M. El 67% de los hogares urbanos en LATAM tienen al menos una mascota. Sin embargo, la experiencia digital del dueño de mascota está fragmentada: una app para comprar comida, otra para buscar paseador, otra para el veterinario, otra para recordar vacunas. No existe una plataforma unificada que resuelva todo.

**Datos clave:**
- Penetración de e-commerce pet en LATAM: ~8% (vs. 35% en EE.UU.), enorme espacio de crecimiento.
- Gasto promedio mensual por mascota en LATAM: USD 50-120 (comida + salud + servicios).
- Tele-veterinaria creció 300% post-pandemia pero sigue sub-penetrada.
- No existe un "super-app de mascotas" dominante en la región.
- Los marketplaces de servicios pet (paseos, sitting) están atomizados y sin estándar de confianza.

## 1.2 Problema que resuelve

El dueño de mascota en LATAM enfrenta:
1. **Fragmentación**: necesita 4-6 apps/servicios distintos para resolver necesidades básicas.
2. **Desconfianza**: no hay verificación estándar de paseadores, cuidadores o vendedores.
3. **Olvidos de salud**: vacunas vencidas, desparasitaciones olvidadas, medicamentos sin refill.
4. **Acceso veterinario limitado**: consultas presenciales costosas y difíciles de agendar fuera de horario.
5. **Recompra ineficiente**: comprar comida cada mes es manual, sin suscripción ni conveniencia.
6. **Cero historial centralizado**: documentos de salud dispersos entre clínicas y papeles.

## 1.3 Posicionamiento

> **PetMatch: el sistema operativo de tu mascota.** Todo lo que tu mascota necesita — comida, salud, servicios, comunidad — en una sola plataforma.

## 1.4 Por qué PetMatch puede ganar

1. **Ventaja de integración**: nadie combina e-commerce + servicios + salud + comunidad en LATAM. La fragmentación ES la oportunidad.
2. **Datos cruzados**: al tener perfil de salud + compras + servicios, podemos personalizar como nadie (recomendaciones de comida por raza/peso, recordatorios inteligentes, detección de patrones).
3. **Efecto red doble**: más proveedores → mejores precios y disponibilidad → más usuarios → más proveedores.
4. **Recurrencia natural**: mascotas comen diario, necesitan paseos semanales, vacunas cada 3-6 meses. El LTV es excepcionalmente alto.
5. **Base existente**: ya tenemos auth, booking, matching, chat, pagos y admin funcionales. No partimos de cero.
6. **Localización LATAM-first**: diseñado para la realidad local (pagos en moneda local, proveedores informales que necesitan formalización, zonas urbanas densas).

---

# 2. PROPUESTA DE VALOR

## 2.1 Para dueños de mascotas (Pet Parents)

| Necesidad | Cómo lo resuelve PetMatch |
|-----------|---------------------------|
| Comprar comida y productos | Marketplace con autoship, comparación de precios, entrega a domicilio |
| Encontrar paseador confiable | Proveedores verificados con reviews, tracking GPS en vivo, fotos del paseo |
| Cuidado cuando viajo | Hospedaje y guardería con perfiles verificados, report cards diarios |
| Salud de mi mascota | Ficha médica digital, recordatorios automáticos, tele-vet 24/7 |
| Emergencias veterinarias | Consulta tele-vet inmediata, derivación a clínica más cercana |
| Socialización | Matching con otras mascotas compatibles para juego y paseos grupales |
| Historial centralizado | Todos los documentos, vacunas, recetas y facturas en un solo lugar |
| Ahorro | Suscripciones con descuento, loyalty points, cupones personalizados |

## 2.2 Para paseadores / cuidadores / proveedores de servicios

| Necesidad | Cómo lo resuelve PetMatch |
|-----------|---------------------------|
| Encontrar clientes | Visibilidad en marketplace con posicionamiento por reputación |
| Gestionar agenda | Calendario con disponibilidad configurable y reservas automáticas |
| Cobrar de forma segura | Pagos garantizados vía plataforma, payouts semanales |
| Construir reputación | Sistema de reviews y badges que genera confianza y más bookings |
| Herramientas de trabajo | Check-in/check-out, report cards, fotos, tracking, chat con dueño |
| Formalización | Perfil profesional verificado, historial de servicios, ingresos declarables |

## 2.3 Para veterinarios

| Necesidad | Cómo lo resuelve PetMatch |
|-----------|---------------------------|
| Nuevos pacientes | Canal de adquisición vía marketplace y tele-vet |
| Consultas remotas | Plataforma de tele-veterinaria con video, chat, prescripciones digitales |
| Historial del paciente | Acceso a ficha médica completa compartida por el dueño |
| Ingresos adicionales | Fee por consulta tele-vet + comisión por recetas/productos recomendados |
| Gestión de agenda | Calendario integrado para consultas presenciales y virtuales |

## 2.4 Para tiendas / sellers

| Necesidad | Cómo lo resuelve PetMatch |
|-----------|---------------------------|
| Canal de venta digital | Marketplace con audiencia cautiva de dueños de mascotas |
| Ventas recurrentes | Autoship genera ingresos predecibles |
| Logística | Integración con servicios de delivery locales |
| Marketing | Placement patrocinado, cupones segmentados, datos de compra |
| Gestión de catálogo | Portal de seller con inventario, precios, variantes y analytics |

## 2.5 Para partners B2B

| Partner | Propuesta |
|---------|-----------|
| Clínicas veterinarias | Canal de captación, tele-vet como extensión, ficha médica compartida |
| Pet shops | Marketplace como canal adicional, inventory sync, analytics |
| Aseguradoras | Data de salud para diseñar seguros pet, distribución directa a usuarios |
| Empresas (employee benefits) | Programa de beneficios pet para empleados (descuentos, membresía premium) |
| Marcas de alimentos/productos | Data de consumo, sampling dirigido, co-marketing |
| Laboratorios farmacéuticos vet | Canal de prescripción digital, refill automático |

---

# 3. ARQUITECTURA DEL PRODUCTO

## 3.1 Perfil de usuario

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Gestionar identidad, preferencias y configuración del usuario |
| **Funcionalidades** | Registro/login (email, Google, Apple), perfil con foto y dirección, preferencias de notificación, método de pago guardado, historial de actividad, configuración de privacidad |
| **Datos que guarda** | nombre, email, teléfono, avatar, dirección(es), coordenadas, método de pago tokenizado, preferencias de notificación, rol, fecha de registro, último acceso |
| **Dependencias** | Auth (NextAuth), Pagos (Stripe) |
| **Fase** | **MVP** (ya existe parcialmente) |

## 3.2 Perfil de mascota

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Centralizar toda la información de la mascota para personalización y salud |
| **Funcionalidades** | CRUD mascota con foto, datos médicos completos, documentos adjuntos (PDF/imagen), QR de identificación, compartir perfil con vet/cuidador, múltiples mascotas por usuario |
| **Datos que guarda** | nombre, especie, raza, edad/fecha nacimiento, peso, tamaño, sexo, esterilizado, microchip, alergias[], medicamentos[], vacunas[], comportamiento[], dieta, condiciones médicas, fotos[], documentos[] |
| **Dependencias** | Perfil de usuario, Storage (Cloudinary) |
| **Fase** | **MVP** (ya existe parcialmente, ampliar con salud y documentos) |

## 3.3 Marketplace de productos

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Permitir compra de comida, farmacia, accesorios y productos pet |
| **Funcionalidades** | Catálogo con categorías y filtros, búsqueda con sugerencias, fichas de producto con fotos/descripción/reviews, carrito de compras, checkout, autoship/suscripción de recompra, comparación de precios, recomendaciones por perfil de mascota, wishlist/favoritos |
| **Datos que guarda** | productos, variantes, categorías, precios, inventario, fotos, reviews, órdenes, items de orden, carritos, suscripciones de recompra |
| **Dependencias** | Perfil de usuario, Perfil de mascota (para recomendaciones), Pagos, Suscripciones |
| **Fase** | **V2** |

## 3.4 Marketplace de servicios

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Conectar dueños con proveedores de servicios para mascotas |
| **Funcionalidades** | Búsqueda por tipo de servicio + ubicación + filtros, perfiles de proveedor con verificación y reviews, calendario de disponibilidad, reserva con fecha/hora/duración, cotización automática, chat previo a la reserva, tracking en vivo del servicio, report card post-servicio, cancelación y reprogramación |
| **Datos que guarda** | servicios, disponibilidad, bookings, eventos de booking, tracking points, report cards, reviews |
| **Dependencias** | Perfil de usuario, Perfil de mascota, Pagos, Tracking, Chat |
| **Fase** | **MVP** (ya existe, mejorar con tracking y report cards) |

## 3.5 Tele-veterinaria

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Acceso a consulta veterinaria remota 24/7 |
| **Funcionalidades** | Solicitud de consulta (urgente o programada), videollamada con vet, chat con vet, compartir fotos/videos del síntoma, prescripción digital, derivación a clínica presencial, historial de consultas, recetas vinculadas a farmacia del marketplace |
| **Datos que guarda** | vet_appointments (fecha, tipo, estado, diagnóstico, prescripción, notas, grabación), vet_prescriptions |
| **Dependencias** | Perfil de mascota (historial), Pagos, Chat, Marketplace de productos (farmacia) |
| **Fase** | **V2** |

## 3.6 Salud y recordatorios

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Gestionar salud preventiva y recordatorios automáticos |
| **Funcionalidades** | Calendario de vacunas con recordatorios, recordatorio de desparasitación, recordatorio de medicamentos (refill), recordatorio de grooming, ficha médica con historial de consultas, peso/crecimiento tracker, alergias y condiciones, documentos de salud (PDF adjuntos) |
| **Datos que guarda** | reminders (tipo, fecha, recurrencia, estado), health_records (tipo, fecha, descripción, vet, documentos), vaccine_records, weight_log |
| **Dependencias** | Perfil de mascota, Notificaciones push, Tele-vet (para vincular consultas) |
| **Fase** | **MVP** (versión básica: recordatorios + vacunas) |

## 3.7 Mensajería y soporte

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Comunicación en tiempo real entre usuarios, proveedores y soporte |
| **Funcionalidades** | Chat 1:1 (dueño ↔ proveedor), chat de soporte, notificaciones de mensajes nuevos, envío de fotos/archivos, estados de mensaje (enviado/leído), chatbot de FAQ, escalamiento a agente humano |
| **Datos que guarda** | conversations, messages (texto, media, estado), conversation_participants |
| **Dependencias** | Perfil de usuario, Socket.io / WebSockets |
| **Fase** | **MVP** (ya existe chat básico, mejorar con media y soporte) |

## 3.8 Tracking / GPS del servicio

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Seguimiento en tiempo real de paseos y servicios a domicilio |
| **Funcionalidades** | Mapa en vivo con ubicación del paseador, ruta recorrida, duración y distancia, fotos/videos durante el paseo, check-in y check-out con geolocalización, report card al finalizar (estado de ánimo, actividad, necesidades), notificación al dueño de inicio/fin |
| **Datos que guarda** | walk_tracking (booking_id, coordenadas[], timestamps[], distancia, duración), walk_media (fotos, videos), walk_report_cards |
| **Dependencias** | Marketplace de servicios, Google Maps API, Notificaciones push |
| **Fase** | **V2** (requiere app mobile para GPS continuo) |

## 3.9 Pagos y billetera

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Procesamiento seguro de pagos, split y payouts |
| **Funcionalidades** | Pago con tarjeta (crédito/débito), wallet con saldo a favor, split de pagos (plataforma + proveedor), payouts automáticos a proveedores (semanal), historial de transacciones, facturas/boletas, reembolsos, cupones y descuentos, pago de suscripciones recurrentes |
| **Datos que guarda** | payments (monto, estado, método, stripe_id), payouts (proveedor, monto, estado, fecha), wallet_transactions, invoices |
| **Dependencias** | Stripe Connect, Perfil de usuario |
| **Fase** | **MVP** (ya existe Stripe básico, ampliar con split y payouts) |

## 3.10 Ratings, reputación y confianza

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Construir confianza en el marketplace mediante reputación verificable |
| **Funcionalidades** | Reviews con estrellas (1-5) + texto + fotos, badges de verificación (identidad, antecedentes, experiencia), score de confianza calculado, respuesta del proveedor a reviews, reportes de conducta, moderación de reviews, super-host/proveedor destacado |
| **Datos que guarda** | reviews (rating, texto, fotos, respuesta), provider_badges, trust_scores, reports |
| **Dependencias** | Marketplace de servicios, Marketplace de productos, Moderación |
| **Fase** | **MVP** (ya existe reviews básico, ampliar con badges y trust score) |

## 3.11 Suscripciones / membresías

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Generar recurrencia y fidelización mediante planes y autoship |
| **Funcionalidades** | Autoship de productos (frecuencia configurable), membresía premium (beneficios: descuentos, tele-vet incluido, prioridad en soporte), planes de salud (vacunas + desparasitación + chequeo anual), gestión de suscripciones (pausar, cancelar, cambiar frecuencia) |
| **Datos que guarda** | subscriptions (tipo, plan, frecuencia, estado, próximo cobro, historial), membership_benefits |
| **Dependencias** | Pagos (Stripe Billing), Marketplace de productos, Tele-vet |
| **Fase** | **V2** |

## 3.12 Admin panel y backoffice

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Gestión operativa completa de la plataforma |
| **Funcionalidades** | Dashboard con métricas clave (GMV, bookings, usuarios, NPS), gestión de usuarios (ban, roles, verificación), gestión de proveedores (aprobación, suspensión), gestión de productos y catálogo, gestión de órdenes y bookings, moderación de reviews y reportes, configuración de comisiones y fees, gestión de cupones y promos, analytics y reportes exportables, gestión de zonas geográficas |
| **Datos que guarda** | admin_logs, platform_config, zones, commission_rules |
| **Dependencias** | Todos los módulos |
| **Fase** | **MVP** (ya existe básico, ampliar progresivamente con cada módulo) |

## 3.13 Partner portal / Provider portal / Vet portal

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Dashboards específicos para cada tipo de proveedor |
| **Funcionalidades** | **Provider**: gestión de servicios, calendario, bookings, ingresos, reviews, documentos. **Seller**: catálogo, inventario, órdenes, payouts, analytics. **Vet**: agenda, consultas tele-vet, pacientes, prescripciones, ingresos. Todos: onboarding guiado, verificación de documentos, soporte dedicado |
| **Datos que guarda** | provider_profiles (documentos, verificación, métricas), seller_profiles, vet_profiles |
| **Dependencias** | Auth (roles), Pagos, Módulo correspondiente |
| **Fase** | **MVP** (provider portal básico ya existe) → V2 (seller + vet portal) |

## 3.14 Módulo futuro: Entrenamiento

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Contenido y servicios de entrenamiento canino/felino |
| **Funcionalidades** | Biblioteca de videos/guías por comportamiento, planes de entrenamiento personalizados, marketplace de entrenadores, sesiones virtuales 1:1, tracking de progreso |
| **Datos que guarda** | training_content, training_plans, training_progress, trainer_profiles |
| **Dependencias** | Perfil de mascota, Marketplace de servicios, Video |
| **Fase** | **V3** |

## 3.15 Módulo futuro: GPS / Safety

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Seguridad y localización de mascotas |
| **Funcionalidades** | Integración con collares GPS (Tractive, Fi, etc.), geocercas con alertas, botón de emergencia "mascota perdida", red de búsqueda comunitaria, QR de identificación con perfil público, alerta a veterinarias cercanas |
| **Datos que guarda** | gps_devices, geofences, lost_pet_alerts, pet_qr_codes |
| **Dependencias** | Perfil de mascota, Comunidad, Maps API, Notificaciones |
| **Fase** | **V3** |

## 3.16 Módulo futuro: Comunidad

| Campo | Detalle |
|-------|---------|
| **Objetivo** | Engagement y retención mediante interacción social |
| **Funcionalidades** | Feed de actividad (fotos de mascotas, logros), grupos por raza/ciudad/interés, eventos pet-friendly (calendario), foros de preguntas y respuestas, desafíos y gamificación, directorio de parques y lugares pet-friendly |
| **Datos que guarda** | posts, comments, groups, events, challenges, pet_friendly_places |
| **Dependencias** | Perfil de usuario, Perfil de mascota, Matching |
| **Fase** | **V3** |

---

# 4. USUARIOS Y ROLES

## 4.1 Pet Parent / Dueño

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Alimentar a mi mascota con la mejor comida al mejor precio; encontrar un cuidador confiable cuando trabajo o viajo; mantener la salud de mi mascota al día; resolver emergencias de salud rápido; socializar a mi mascota |
| **Dolores** | No confío en dejar mi mascota con desconocidos; olvido las vacunas y desparasitaciones; la comida se acaba y no tengo tiempo de ir a comprar; las consultas veterinarias son caras y difíciles de agendar; no tengo un historial médico organizado |
| **Acciones principales** | Registrar mascotas, buscar/reservar servicios, comprar productos, consultar tele-vet, gestionar salud, chatear con proveedores, dejar reviews |
| **KPIs** | Tasa de activación (1er booking o compra en 7 días), frecuencia de uso mensual, LTV, NPS, tasa de retención M1/M3/M6, bookings/mes, GMV/usuario |

## 4.2 Cuidador / Paseador / Boarding Host

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Generar ingresos cuidando mascotas; construir una clientela recurrente; gestionar mi agenda eficientemente; demostrar profesionalismo y confiabilidad |
| **Dolores** | Clientes no llegan de forma consistente; cobrar es complicado (efectivo, transferencias); no tengo herramientas profesionales (tracking, reportes); malos clientes que cancelan o no pagan; falta de respaldo ante incidentes |
| **Acciones principales** | Crear perfil y servicios, configurar disponibilidad, aceptar/rechazar bookings, hacer check-in/check-out, enviar report cards, cobrar, chatear con dueños |
| **KPIs** | Tasa de aceptación de bookings, rating promedio, tasa de completación, ingresos mensuales, tasa de repetición de clientes, tiempo de respuesta |

## 4.3 Groomer

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Recibir clientes de forma consistente; mostrar mi trabajo (portafolio); gestionar citas eficientemente |
| **Dolores** | Dependencia de redes sociales para captar clientes; no-shows frecuentes; dificultad para mostrar precios según tamaño/raza; cobro informal |
| **Acciones principales** | Crear servicios de grooming con precios por tamaño, gestionar agenda, confirmar citas, enviar fotos del resultado, cobrar |
| **KPIs** | Bookings/semana, rating promedio, tasa de no-show, ingresos, tasa de clientes recurrentes |

## 4.4 Veterinario

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Atender pacientes remotos sin infraestructura propia; generar ingresos adicionales; acceder al historial médico del paciente; prescribir y que el dueño pueda comprar fácilmente |
| **Dolores** | Montar una plataforma de tele-vet propia es costoso; los dueños llegan sin historial; seguimiento post-consulta difícil; prescripciones en papel que se pierden |
| **Acciones principales** | Configurar disponibilidad, atender videoconsultas, revisar historial de mascota, prescribir medicamentos, derivar a presencial, chatear seguimiento |
| **KPIs** | Consultas/semana, rating, tiempo promedio de consulta, tasa de derivación, ingresos, tasa de resolución en primera consulta |

## 4.5 Seller / Tienda

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Vender productos online sin montar e-commerce propio; gestionar inventario eficientemente; llegar a nuevos clientes; generar ventas recurrentes con autoship |
| **Dolores** | Montar e-commerce propio es caro; competir con grandes retailers; gestión de envíos compleja; márgenes apretados |
| **Acciones principales** | Subir catálogo de productos, gestionar inventario y precios, procesar órdenes, gestionar envíos, ver analytics de ventas |
| **KPIs** | GMV, órdenes/día, ticket promedio, tasa de devolución, rating de productos, suscripciones activas, margen neto |

## 4.6 Soporte / Operaciones

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Resolver problemas de usuarios rápido; mediar disputas entre dueños y proveedores; mantener calidad del marketplace; escalar incidentes graves |
| **Dolores** | Volumen de tickets alto; casos complejos que requieren contexto; disputas de pago difíciles de resolver; emergencias fuera de horario |
| **Acciones principales** | Responder tickets, mediar disputas, procesar reembolsos, verificar proveedores, escalar incidentes, actualizar FAQ |
| **KPIs** | Tiempo de primera respuesta, tiempo de resolución, CSAT, tickets/agente/día, tasa de escalamiento, backlog |

## 4.7 Admin

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Monitorear salud del marketplace; tomar decisiones basadas en datos; configurar reglas de negocio; gestionar equipo operativo |
| **Dolores** | Falta de visibilidad en tiempo real; configuraciones que requieren deploy; métricas dispersas; fraude difícil de detectar |
| **Acciones principales** | Ver dashboards, gestionar usuarios y proveedores, configurar comisiones/promos/zonas, aprobar proveedores, exportar reportes, gestionar catálogo |
| **KPIs** | GMV total, take rate, CAC, LTV, burn rate, NPS, proveedores activos, fill rate de servicios |

## 4.8 Moderación / Trust & Safety

| Campo | Detalle |
|-------|---------|
| **Jobs to be done** | Garantizar seguridad de mascotas y usuarios; detectar fraude; mantener calidad de contenido; aplicar políticas de la plataforma |
| **Dolores** | Reviews falsos; proveedores que no cumplen estándares; fotos/contenido inapropiado; disputas complejas; emergencias con mascotas |
| **Acciones principales** | Revisar reportes, verificar documentos de proveedores, moderar reviews, investigar fraude, aplicar sanciones (warning, suspensión, ban), gestionar emergencias |
| **KPIs** | Reportes resueltos/día, tiempo de resolución, tasa de fraude detectado, falsos positivos, proveedores suspendidos, incidentes graves/mes |

---

# 5. FLUJOS CRÍTICOS DEL USUARIO

## 5.1 Onboarding de usuario

```
1. Landing page → CTA "Crear cuenta gratis"
2. Formulario: nombre, email, contraseña (o "Continuar con Google")
3. Verificación de email (link mágico)
4. Selección de rol: "Soy dueño de mascota" / "Quiero ofrecer servicios" / "Soy veterinario"
5. [Si dueño] → "Agregar tu primera mascota" (wizard guiado)
6. [Si proveedor] → "Completa tu perfil profesional" (wizard de proveedor)
7. Permiso de ubicación (para servicios cercanos)
8. Permiso de notificaciones push
9. Pantalla de bienvenida con acciones sugeridas:
   - "Buscar paseador cerca"
   - "Explorar productos"
   - "Agendar vacuna"
10. Dashboard personalizado
```

**Decisión UX:** Onboarding progresivo. No pedir toda la info de entrada. Mascota se puede agregar después, pero se incentiva en el flujo.

## 5.2 Onboarding de mascota

```
1. Dashboard → "Agregar mascota" (o desde onboarding)
2. Paso 1: Nombre + Foto (drag & drop o cámara)
3. Paso 2: Especie (perro/gato) + Raza (autocomplete) + Sexo
4. Paso 3: Fecha de nacimiento (o edad aprox.) + Peso + Tamaño
5. Paso 4: Esterilizado (sí/no) + Microchip (opcional)
6. Paso 5: Temperamento (multi-select: amigable, juguetón, tímido, etc.)
7. Paso 6: Nivel de energía (bajo/medio/alto)
8. Paso 7 (opcional): Alergias, condiciones médicas, medicamentos actuales
9. Paso 8 (opcional): Vacunas al día (sí/no) → si sí, agregar registros
10. Confirmación: "¡[Nombre] ya está en PetMatch!" con perfil preview
11. CTA: "Agregar otra mascota" o "Ir al dashboard"
```

**Decisión UX:** Pasos 7-8 son opcionales y se pueden completar después. Se muestra barra de progreso "perfil 60% completo" para incentivar.

## 5.3 Búsqueda y reserva de un paseo

```
1. Home/Dashboard → "Buscar paseador" o Tab "Servicios"
2. Filtros: tipo=Paseo, ubicación (auto-detect o manual), fecha, hora
3. Listado de paseadores disponibles: foto, nombre, rating, precio/hora, distancia, badges
4. Tap en paseador → Perfil completo: bio, experiencia, fotos, reviews, servicios, tarifas, disponibilidad
5. "Reservar paseo" → Seleccionar mascota(s) (si tiene múltiples)
6. Seleccionar fecha y hora del calendario del paseador
7. Seleccionar duración (30min, 1h, 1.5h)
8. Notas especiales (e.g., "tira de la correa", "no le gustan perros grandes")
9. Resumen de reserva: mascota, paseador, fecha, hora, duración, precio total
10. Confirmar y pagar (tarjeta guardada o nueva)
11. Confirmación: "Reserva enviada. [Paseador] confirmará en máx. 2 horas"
12. Notificación push al paseador
13. Paseador acepta → notificación al dueño: "¡Reserva confirmada!"
14. Paseador rechaza → notificación: "No disponible. ¿Ver otros paseadores?"
```

## 5.4 Búsqueda y reserva de hospedaje / guardería

```
1. Tab Servicios → Filtro: Hospedaje o Guardería
2. Filtros adicionales: fechas (check-in/check-out), tamaño de mascota, precio máx.
3. Listado: foto del espacio, nombre, rating, precio/noche, capacidad, comodidades
4. Tap → Perfil: fotos del espacio, descripción, reglas, reviews, calendario
5. "Reservar" → Seleccionar mascota(s)
6. Seleccionar fecha check-in y check-out
7. Preguntas del proveedor (e.g., "¿come comida especial?", "¿tiene medicamentos?")
8. Resumen: mascota, proveedor, fechas, noches, precio total + fee de servicio
9. Pagar (se retiene el cobro, no se cobra hasta confirmación)
10. Proveedor recibe solicitud → puede aceptar, rechazar o solicitar más info
11. Si acepta → cobro se procesa, confirmación a ambos
12. Día del check-in: recordatorio a ambos, instrucciones de llegada
13. Check-in: proveedor confirma recepción + foto de llegada
14. Durante estadía: fotos/updates diarios (report card)
15. Check-out: proveedor confirma entrega + report card final
16. Dueño recibe notificación de check-out completado
17. Prompt de review
```

## 5.5 Compra de comida o producto con recompra

```
1. Tab "Tienda" o Home → sección "Productos recomendados para [Mascota]"
2. Categorías: Alimento, Farmacia, Accesorios, Higiene, Juguetes
3. Filtros: marca, raza, tamaño, rango de precio, rating
4. Tap producto → Ficha: fotos, descripción, ingredientes, peso, precio, reviews, "recomendado para [raza]"
5. Seleccionar variante (tamaño/sabor)
6. "Agregar al carrito" o "Suscribirse" (autoship)
7. Si autoship: seleccionar frecuencia (cada 2, 4, 6, 8 semanas)
8. Carrito → ver items, ajustar cantidades, aplicar cupón
9. Checkout → dirección de envío (guardada o nueva)
10. Método de pago
11. Resumen: productos, envío, descuento por autoship (-10%), total
12. Confirmar compra
13. Confirmación + número de orden + estimado de entrega
14. Notificaciones: "Pedido confirmado" → "En preparación" → "En camino" → "Entregado"
15. Si autoship: recordatorio 3 días antes del próximo envío → "Confirmar/Pausar/Cancelar"
```

## 5.6 Solicitud de tele-vet

```
1. Home → "Consulta veterinaria" o Tab "Salud" → "Hablar con un vet"
2. Seleccionar mascota
3. Seleccionar tipo: "Consulta general" / "Urgencia" / "Segunda opinión" / "Receta"
4. Describir síntomas (texto) + adjuntar fotos/videos (opcional)
5. Si urgencia → cola prioritaria (fee adicional)
6. Si programada → seleccionar fecha/hora disponible del vet
7. Resumen: mascota, tipo, precio, vet asignado (o "próximo disponible")
8. Pagar
9. Sala de espera virtual (con tiempo estimado si es urgencia)
10. Conexión: videollamada con vet (acceso al perfil de la mascota y historial)
11. Durante consulta: vet puede ver historial, alergias, medicamentos
12. Post-consulta: resumen escrito del vet + diagnóstico + prescripción digital
13. Si prescripción → CTA "Comprar medicamento" (link directo a farmacia del marketplace)
14. Si derivación → CTA "Buscar clínica cercana" + orden de referencia
15. Historial de la consulta se guarda en perfil de la mascota
16. Prompt de review del vet
```

## 5.7 Solicitud de veterinario a domicilio

```
1. Tab "Salud" → "Vet a domicilio"
2. Seleccionar mascota
3. Seleccionar servicio: consulta general, vacunación, desparasitación, chequeo
4. Seleccionar fecha/hora preferida
5. Dirección (auto-detect o manual)
6. Notas adicionales (síntomas, comportamiento del animal con extraños)
7. Búsqueda de vets disponibles en la zona → listado con perfil, rating, precio
8. Seleccionar vet
9. Resumen + pagar
10. Vet confirma → notificación al dueño
11. Día de la visita: tracking del vet en camino
12. Vet llega → check-in con geolocalización
13. Consulta → notas, diagnóstico, prescripción registrados en la app
14. Vet sale → check-out
15. Resumen de consulta + prescripción en perfil de mascota
16. Review
```

## 5.8 Seguimiento en vivo del servicio

```
1. Paseador inicia el servicio → tap "Iniciar paseo" (check-in con geoloc)
2. App del paseador envía ubicación cada 15 segundos
3. Dueño recibe push: "[Mascota] está de paseo con [Paseador]"
4. Dueño abre mapa en vivo: ve ubicación actual + ruta recorrida
5. Paseador puede enviar fotos/videos durante el paseo
6. Dueño recibe fotos en tiempo real
7. Paseador finaliza → tap "Finalizar paseo" (check-out con geoloc)
8. Report card automática: duración, distancia, ruta, fotos, nota del paseador
9. Dueño recibe push: "[Mascota] terminó su paseo. ¿Cómo estuvo?"
10. Ruta y report card se guardan en historial
```

## 5.9 Check-in / Check-out del paseador o cuidador

```
CHECK-IN:
1. Proveedor llega al punto de recogida
2. Tap "Check-in" → app valida geolocalización (dentro de 200m de la dirección)
3. Foto obligatoria de la mascota al recibirla
4. Confirmar estado: "mascota recibida en buen estado" (checkbox)
5. Notas opcionales: "dueño indicó que no comió"
6. Dueño recibe notificación: "[Paseador] recogió a [Mascota]"

CHECK-OUT:
1. Servicio completado
2. Tap "Check-out" → geolocalización
3. Foto obligatoria de la mascota al devolverla
4. Report card: estado de ánimo, actividad realizada, hizo necesidades, comió/bebió, notas
5. Dueño recibe push: "[Mascota] está de vuelta"
6. Timer de confirmación: si dueño no confirma en 30min, se auto-completa
```

## 5.10 Cancelación y reembolso

```
1. Dueño va a "Mis reservas" → selecciona booking → "Cancelar"
2. Sistema evalúa política de cancelación:
   - >48h antes: reembolso 100%
   - 24-48h antes: reembolso 50%
   - <24h antes: sin reembolso (o fee de cancelación)
   - Servicio ya iniciado: sin reembolso
3. Muestra monto de reembolso → "Confirmar cancelación"
4. Reembolso procesado (inmediato a wallet, 5-10 días a tarjeta)
5. Notificación al proveedor: "Reserva cancelada por el dueño"
6. Si el proveedor cancela:
   - Reembolso 100% al dueño siempre
   - Penalización al proveedor (afecta ranking)
   - Sugerencia automática de proveedores alternativos al dueño
7. Registro de cancelación en historial de ambos
```

## 5.11 Rating y reseña

```
1. Servicio completado o producto recibido → push: "¿Cómo estuvo?"
2. Pantalla de review:
   - Rating general (1-5 estrellas)
   - Sub-ratings (puntualidad, cuidado, comunicación — para servicios)
   - Texto libre (mín. 20 caracteres para publicar)
   - Fotos opcionales
   - "¿Recomendarías a [proveedor]?" (sí/no)
3. Publicar review
4. Review visible en perfil del proveedor (inmediatamente)
5. Proveedor recibe notificación → puede responder públicamente
6. Si rating ≤ 2: trigger automático para revisión de Trust & Safety
7. Review editable hasta 48h después de publicación
8. Reviews verificadas con badge "compra/servicio verificado"
```

## 5.12 Alta de proveedor

```
1. Registro como proveedor (o cambio de rol desde dueño)
2. Wizard de onboarding:
   a. Datos personales: nombre completo, RUT/DNI, teléfono, foto profesional
   b. Tipo de servicio: paseador, cuidador, groomer, hospedaje, vet
   c. Experiencia: años, certificaciones, descripción
   d. Fotos del espacio (si aplica: hospedaje, grooming)
   e. Cobertura geográfica: zona/radio de acción
   f. Servicios y tarifas: qué ofrece + precio + duración
   g. Disponibilidad semanal (calendario)
   h. Documentos: cédula de identidad, antecedentes (si aplica), certificaciones
   i. Datos bancarios para payouts
3. Envío para verificación
4. Estado: "En revisión" (24-48h)
5. Equipo de Trust & Safety verifica documentos
6. Aprobado → perfil publicado, notificación "¡Estás listo!"
7. Rechazado → notificación con razón + qué corregir
```

## 5.13 Verificación de proveedor

```
1. Proveedor envía documentos en alta
2. Sistema automático:
   - Validación de formato de cédula/RUT
   - OCR básico para extraer datos
   - Match nombre de documento vs nombre de registro
3. Revisión manual (Trust & Safety):
   - Verificar identidad (foto + documento)
   - Verificar antecedentes penales (si integración disponible)
   - Verificar certificaciones (vet: título, groomer: certificado)
   - Verificar espacio (fotos de hospedaje)
4. Resultado:
   - ✅ Verificado → badge "Identidad verificada" + acceso completo
   - ⚠️ Parcial → publicado con limitaciones (e.g., máx. 3 bookings simultáneos)
   - ❌ Rechazado → no se publica, puede reenviar documentos
5. Re-verificación cada 12 meses
6. Badges adicionales: "Super Provider" (>50 servicios, >4.8 rating), "Experiencia certificada"
```

## 5.14 Gestión de agenda del proveedor

```
1. Provider portal → "Mi agenda"
2. Vista semanal con slots de disponibilidad
3. Configurar horario recurrente: lunes a viernes 8am-6pm
4. Bloquear días específicos (vacaciones, feriados)
5. Configurar capacidad: máx. mascotas simultáneas por slot
6. Bookings confirmados aparecen en el calendario automáticamente
7. Notificación 1h antes de cada servicio
8. Vista del día: listado de servicios con hora, mascota, dirección, notas
9. Drag & drop para reagendar (notifica al dueño automáticamente)
10. Sincronización opcional con Google Calendar
```

## 5.15 Soporte y resolución de incidentes

```
1. Usuario → "Ayuda" (desde menú o booking específico)
2. Chatbot de FAQ: respuestas automáticas a preguntas comunes
3. Si no resuelve → "Hablar con soporte" → chat en vivo
4. Categorías de ticket:
   - Problema con pago
   - Problema con servicio
   - Problema con producto/envío
   - Reportar proveedor
   - Emergencia con mascota
   - Otro
5. Agente de soporte recibe ticket con contexto (booking, pago, usuarios)
6. Si disputa:
   a. Agente contacta a ambas partes
   b. Revisa evidencia (fotos, tracking, mensajes)
   c. Decisión: reembolso total/parcial, crédito, o sin acción
   d. Notificación a ambas partes con resolución
7. Si emergencia con mascota:
   a. Escalamiento inmediato
   b. Contactar vet más cercano
   c. Activar seguro/garantía si aplica
8. Ticket cerrado → encuesta de satisfacción CSAT
9. Registro en historial del usuario y del proveedor
```

---

# 6. DEFINICIÓN DEL MVP

## 6.1 Contexto

PetMatch ya tiene implementado: auth, CRUD mascotas (básico), marketplace de servicios (4 tipos), bookings, matching de mascotas, chat, directorio de vets, pagos Stripe y panel admin. Sobre esta base se debe decidir la dirección del MVP mejorado.

## 6.2 Opción A: MVP enfocado en Servicios

**Wedge:** "La app más confiable para paseos y cuidado de mascotas en [ciudad]"

**Incluye:**
- Perfil de mascota mejorado (salud básica, comportamiento, documentos)
- Marketplace de servicios mejorado (search por mapa, filtros avanzados)
- Verificación de proveedores (identidad + antecedentes)
- Sistema de reviews mejorado (sub-ratings, badges)
- Tracking de paseo en vivo (GPS)
- Report cards post-servicio
- Check-in / check-out con geolocalización
- Chat mejorado (fotos, archivos)
- Pagos mejorados (split, payouts a proveedores)
- Política de cancelación y reembolsos
- Recordatorios básicos (vacunas, desparasitación)
- Panel admin mejorado (verificación, moderación)

**No incluye:** E-commerce, tele-vet, autoship, suscripciones, comunidad, entrenamiento, GPS safety.

**Tiempo estimado:** 8-10 semanas sobre la base existente.

**Ventajas:**
- Resuelve el dolor más urgente y frecuente (¿quién cuida a mi mascota?)
- Alta frecuencia de uso (paseos diarios/semanales)
- Supply-side manageable (captar 50-100 paseadores en una ciudad)
- Diferenciación clara con tracking y verificación
- Genera datos de usuario valiosos para expansión

**Riesgos:**
- Mercado competido (apps de paseo ya existen)
- Requiere masa crítica de proveedores antes de lanzar
- Operación intensiva (verificación, soporte, incidentes)

## 6.3 Opción B: MVP enfocado en E-commerce + Salud

**Wedge:** "Todo lo que tu mascota necesita: compra, salud y recordatorios en un solo lugar"

**Incluye:**
- Perfil de mascota completo (salud, vacunas, documentos)
- Marketplace de productos (catálogo, carrito, checkout)
- Recomendaciones personalizadas por perfil de mascota
- Autoship / suscripción de recompra
- Recordatorios de salud (vacunas, desparasitación, medicamentos, grooming)
- Ficha médica digital
- Directorio de vets mejorado
- Chat con sellers
- Pagos y órdenes
- Panel admin con gestión de catálogo y sellers
- Cupones y promos de lanzamiento

**No incluye:** Marketplace de servicios (solo directorio), tracking GPS, tele-vet, comunidad, matching.

**Tiempo estimado:** 10-12 semanas (e-commerce es más complejo desde cero).

**Ventajas:**
- Monetización inmediata (comisión por venta)
- Recurrencia natural (comida se acaba cada mes)
- Menor fricción operativa (no hay proveedores de servicio en campo)
- Autoship genera MRR predecible
- Datos de salud crean switching cost

**Riesgos:**
- Competir con retailers establecidos (Amazon, MercadoLibre, pet shops online)
- Requiere catálogo y logística/fulfillment desde día 1
- Margen bajo si no hay volumen
- Menos diferenciación vs. un e-commerce genérico

## 6.4 Decisión: MVP A (Servicios)

**Justificación:**

1. **Ya tenemos la base**: el proyecto actual ya tiene servicios, bookings y pagos funcionando. Mejorar > construir desde cero.
2. **Diferenciación real**: en LATAM no hay un marketplace de servicios pet con verificación + tracking + report cards al nivel de Rover/Wag. En e-commerce hay muchos players.
3. **Supply-side controlable**: empezar con 50-100 proveedores en una ciudad es factible. Montar un catálogo de productos con logística es mucho más complejo.
4. **Frecuencia alta**: paseos son semanales/diarios vs. compra de comida es mensual. Mayor frecuencia = más engagement = más datos = más retención.
5. **Confianza como moat**: la verificación de proveedores, tracking y report cards crean confianza difícil de replicar por competidores informales (WhatsApp, Instagram).
6. **Base para expansión**: una vez que tenemos usuarios activos con mascotas registradas, agregar e-commerce y salud es natural (V2).

**Lo que SÍ debe incluir el MVP aunque suene "mucho":**
- Verificación de proveedores → sin esto no hay confianza
- Tracking de paseo → es el diferenciador principal
- Report cards → es lo que genera "wow" y viralidad (compartir en redes)
- Split de pagos → sin esto no podemos pagar a proveedores

**Lo que NO debe entrar al MVP aunque suene atractivo:**
- E-commerce / marketplace de productos → V2
- Tele-veterinaria → V2
- Autoship / suscripciones → V2
- Matching de mascotas → ya existe pero es secundario, se mantiene sin mejoras
- Comunidad → V3
- Entrenamiento → V3
- GPS safety / collares → V3

---

# 7. FEATURES DETALLADAS

## 7.1 Pet Profile (Perfil de mascota)

| Campo | Detalle |
|-------|---------|
| **Descripción** | Perfil completo de la mascota con datos de identificación, salud, comportamiento y documentos. Es la entidad central de la plataforma. |
| **Valor para el usuario** | Un solo lugar para toda la info de mi mascota. Proveedores ven lo que necesitan saber. Recordatorios automáticos basados en el perfil. |
| **Lógica de negocio** | Cada usuario puede tener múltiples mascotas. El perfil se comparte automáticamente con proveedores al hacer booking. Datos de salud alimentan el motor de recordatorios. Raza + peso + edad alimentan recomendaciones de productos. |
| **Datos** | nombre, especie (DOG/CAT), raza, sexo, fecha_nacimiento, peso (kg), tamaño (S/M/L/XL), esterilizado (bool), microchip (string), nivel_energia (LOW/MED/HIGH), temperamento[] (array de traits), alergias[] (texto libre), medicamentos[] (nombre, dosis, frecuencia), condiciones_medicas[] (texto), dieta (texto), vacunas[] (nombre, fecha, próxima), documentos[] (tipo, url, fecha), fotos[] (url), created_at, updated_at |
| **Reglas** | Nombre obligatorio, especie obligatoria, al menos 1 foto recomendada. Peso se valida por rango realista por especie. Vacunas requieren fecha. Documentos: máx. 10MB por archivo, formatos PDF/JPG/PNG. |
| **Edge cases** | Mascota fallecida (marcar como inactiva, mantener historial). Mascota adoptada (transferir perfil entre usuarios). Raza mixta ("Mestizo" como opción). Peso desconocido (permitir vacío). Múltiples dueños (compartir perfil). |
| **Eventos analíticos** | `pet_created`, `pet_updated`, `pet_photo_uploaded`, `pet_vaccine_added`, `pet_document_uploaded`, `pet_profile_shared`, `pet_profile_completion_rate` |

## 7.2 Búsqueda por mapa y filtros

| Campo | Detalle |
|-------|---------|
| **Descripción** | Búsqueda de proveedores de servicios con vista de mapa interactivo y filtros avanzados. |
| **Valor para el usuario** | Encontrar el proveedor más cercano, mejor calificado y disponible para mi necesidad específica. |
| **Lógica de negocio** | Búsqueda por radio desde ubicación del usuario (default 5km, máx. 25km). Resultados ordenados por: relevancia (distancia × rating × disponibilidad). Filtros combinables. Mapa muestra pins de proveedores con precio y rating. |
| **Filtros disponibles** | Tipo de servicio, fecha/hora, rango de precio, rating mínimo, tamaño de mascota aceptado, badges (verificado, super provider), distancia, ordenar por (precio, rating, distancia, popularidad) |
| **Reglas** | Mínimo ubicación o ciudad para buscar. Solo mostrar proveedores con disponibilidad en la fecha seleccionada. Proveedores suspendidos o no verificados no aparecen. Paginación: 20 resultados por página. |
| **Edge cases** | Sin resultados en la zona → sugerir ampliar radio o cambiar fecha. Proveedor aparece disponible pero se reserva antes de confirmar → manejar race condition con bloqueo temporal de slot (5 min). Ubicación denegada → búsqueda por ciudad/barrio manual. |
| **Eventos analíticos** | `search_performed` (filtros usados, resultados_count), `search_filter_applied`, `map_pin_tapped`, `provider_profile_viewed_from_search`, `search_no_results` |

## 7.3 Perfiles de proveedores con verificación

| Campo | Detalle |
|-------|---------|
| **Descripción** | Perfil público del proveedor con información profesional, verificaciones, reviews, galería y servicios ofrecidos. |
| **Valor para el usuario** | Evaluar confiabilidad y experiencia del proveedor antes de reservar. |
| **Lógica de negocio** | Perfil incluye: bio, experiencia (años), fotos del proveedor y espacio, servicios con precios, calendario de disponibilidad, reviews, badges de verificación, tasa de aceptación, tiempo de respuesta promedio, estadísticas (servicios completados, rating). Trust score calculado: (rating × 0.4) + (completados × 0.2) + (verificación × 0.2) + (antigüedad × 0.1) + (respuesta × 0.1). |
| **Badges** | 🔵 Identidad verificada, 🟢 Antecedentes OK, ⭐ Super Provider (>50 servicios, >4.8), 🏠 Espacio verificado (para hospedaje), 📋 Certificación (para groomers/vets) |
| **Reglas** | Perfil no visible hasta verificación mínima (identidad). Máximo 20 fotos. Bio mín. 50 caracteres. Al menos 1 servicio activo para aparecer en búsqueda. Reviews no editables por el proveedor (solo puede responder). |
| **Edge cases** | Proveedor nuevo sin reviews → badge "Nuevo" + precio introductorio sugerido. Verificación vencida → aviso al proveedor, perfil se oculta si no renueva en 30 días. Proveedor con rating <3.5 por 3+ meses → revisión automática. |
| **Eventos analíticos** | `provider_profile_viewed`, `provider_badge_earned`, `provider_verification_submitted`, `provider_verification_approved/rejected`, `provider_trust_score_changed` |

## 7.4 Pago seguro dentro de la plataforma

| Campo | Detalle |
|-------|---------|
| **Descripción** | Procesamiento de pagos con retención hasta completación del servicio, protegiendo a ambas partes. |
| **Valor para el usuario** | Dueño: pago seguro, reembolso si algo sale mal. Proveedor: cobro garantizado. |
| **Lógica de negocio** | Al confirmar booking: se cobra al dueño. Monto retenido en Stripe hasta completar servicio. Al completar servicio (check-out): se libera pago. Split: plataforma retiene comisión (15-20%), resto va a payout del proveedor. Payouts: automáticos cada lunes (o mínimo acumulado USD 20). |
| **Métodos de pago** | Tarjeta crédito/débito (Stripe), transferencia bancaria (según país). Futuro: wallet con saldo. |
| **Reglas** | Pago siempre dentro de la plataforma (prohibir pagos en efectivo en TOS). Si servicio no se completa en 24h post-hora agendada → alerta a soporte. Reembolso automático si proveedor cancela. Fee de servicio (5-8%) visible para el dueño antes del pago. |
| **Edge cases** | Tarjeta rechazada → reintentar con otra o agregar nueva. Pago exitoso pero proveedor no responde → auto-cancelación a las 24h con reembolso. Disputa → congelar pago hasta resolución. Moneda local vs USD → Stripe maneja conversión. |
| **Eventos analíticos** | `payment_initiated`, `payment_succeeded`, `payment_failed`, `refund_processed`, `payout_sent`, `dispute_opened`, `dispute_resolved` |

## 7.5 Split de pagos y payouts

| Campo | Detalle |
|-------|---------|
| **Descripción** | División automática del pago entre plataforma y proveedor con payouts programados. |
| **Valor para el usuario** | Proveedor recibe su dinero de forma predecible y transparente. Plataforma cobra su comisión automáticamente. |
| **Lógica de negocio** | Stripe Connect con split automático. Comisión plataforma: 15% servicios, 12% productos. Fee de servicio al dueño: 7%. Total take rate: ~22% en servicios. Payouts semanales (lunes) o cuando acumulado ≥ USD 20. Proveedor ve dashboard de ingresos: pendientes, en tránsito, pagados. |
| **Reglas** | Proveedor debe tener cuenta bancaria verificada para recibir payouts. Retención de 48h post-servicio antes de liberar payout (ventana de disputa). Si hay incidente abierto, payout se congela. |
| **Edge cases** | Cuenta bancaria inválida → payout falla, retry con notificación. Cambio de cuenta bancaria → verificar nuevamente, payout pausado 72h. Proveedor en país no soportado por Stripe → alternativa local. |
| **Eventos analíticos** | `payout_scheduled`, `payout_completed`, `payout_failed`, `commission_collected`, `provider_earnings_viewed` |

## 7.6 Tracking del paseo o visita

| Campo | Detalle |
|-------|---------|
| **Descripción** | Seguimiento GPS en tiempo real del paseo con ruta, duración y distancia. |
| **Valor para el usuario** | Tranquilidad de saber dónde está mi mascota en todo momento. Evidencia de que el paseo efectivamente se realizó. |
| **Lógica de negocio** | Paseador inicia tracking al hacer check-in. App envía coordenadas cada 15 segundos vía WebSocket. Frontend del dueño renderiza mapa con posición actual + ruta. Al finalizar: se calcula distancia total y duración. Ruta guardada como array de coordenadas con timestamps. |
| **Reglas** | Tracking solo activo durante servicio confirmado. Si paseador pierde señal >5min → notificar al dueño "señal intermitente". Datos de ubicación se eliminan después de 30 días (privacidad). Solo el dueño del booking puede ver el tracking. |
| **Edge cases** | Sin GPS (indoor, subterráneo) → mostrar última ubicación conocida + aviso. Paseador apaga ubicación → notificación de warning + posible flag. Batería baja del paseador → notificación preventiva. Múltiples mascotas en mismo paseo → un solo tracking. |
| **Eventos analíticos** | `tracking_started`, `tracking_ended`, `tracking_live_viewed` (por dueño), `tracking_signal_lost`, `walk_distance_recorded`, `walk_duration_recorded` |

## 7.7 Fotos / Videos / Report Card

| Campo | Detalle |
|-------|---------|
| **Descripción** | Paseador/cuidador envía fotos, videos y un reporte estructurado del servicio. |
| **Valor para el usuario** | Ver cómo estuvo mi mascota durante el servicio. Contenido compartible en redes sociales. Evidencia de buen servicio. |
| **Lógica de negocio** | Durante servicio: paseador puede tomar fotos/videos y enviar al dueño en tiempo real (vía chat del booking). Al finalizar: report card estructurada con campos predefinidos. Fotos se almacenan en Cloudinary con referencia al booking. |
| **Report card campos** | Estado de ánimo (😊 feliz, 😐 normal, 😟 ansioso), actividad (caminata, juego, descanso), hizo necesidades (pipi, popo, ambos, no), comió (sí/no), bebió agua (sí/no), sociabilización (jugó con otros perros), notas del paseador (texto libre), fotos adjuntas |
| **Reglas** | Mínimo 1 foto por report card. Fotos máx. 5MB cada una, videos máx. 30 segundos. Report card obligatoria para completar servicio (check-out). |
| **Edge cases** | Cámara no funciona → permitir completar report card sin foto (flag para soporte). Mascota con incidente (herida, perdida) → report card con flag "incidente" → escalamiento automático. |
| **Eventos analíticos** | `report_card_created`, `photo_sent_during_service`, `report_card_viewed_by_owner`, `report_card_shared_socially` |

## 7.8 Chat en tiempo real

| Campo | Detalle |
|-------|---------|
| **Descripción** | Mensajería instantánea entre dueño y proveedor, vinculada a bookings y matching. |
| **Valor para el usuario** | Coordinar detalles del servicio, resolver dudas, recibir actualizaciones. |
| **Lógica de negocio** | Conversación se crea automáticamente al: (a) confirmar booking, (b) match mutuo de mascotas. Mensajes: texto, fotos, ubicación compartida. Estados: enviado, entregado, leído. Push notification para mensajes nuevos. Chat vinculado al booking para contexto. |
| **Reglas** | Solo usuarios con booking activo o match pueden chatear entre sí (no spam). Chat se archiva 30 días después de completar servicio. Prohibido compartir datos de contacto externo (teléfono, email) en primeros mensajes → warning automático. Mensajes reportables. |
| **Edge cases** | Usuario bloqueado → no puede enviar mensajes. Proveedor no responde en 24h → reminder automático + notificación al dueño. Mensaje con contenido inapropiado → filtro automático + report. |
| **Eventos analíticos** | `message_sent`, `message_read`, `chat_opened`, `media_shared_in_chat`, `contact_share_attempt_blocked` |

## 7.9 Suscripción de recompra / Autoship

| Campo | Detalle |
|-------|---------|
| **Descripción** | Entrega recurrente automática de productos (comida, farmacia) con descuento. |
| **Valor para el usuario** | Nunca se acaba la comida de mi mascota. Ahorro por suscripción. Cero esfuerzo de recompra. |
| **Lógica de negocio** | Al comprar producto elegible → opción "Suscribirse". Frecuencias: 2, 4, 6, 8 semanas. Descuento por autoship: 5-15% según producto. 3 días antes del envío → notificación: "Tu pedido se procesa en 3 días. Confirmar / Pausar / Cancelar". Cobro automático con tarjeta guardada. Si falla cobro → 2 reintentos en 48h → si falla → pausar suscripción + notificar. |
| **Reglas** | Mínimo 2 entregas para obtener descuento de autoship. Cancelación sin penalidad en cualquier momento. Pausar máximo 3 meses. Si producto se descontinúa → notificar + sugerir alternativa. |
| **Edge cases** | Producto agotado → notificar, saltar envío, no cobrar. Cambio de precio → notificar antes del próximo cobro. Cambio de dirección → pedir confirmación en próximo envío. Mascota cambia de dieta → sugerir actualizar suscripción. |
| **Eventos analíticos** | `subscription_created`, `subscription_paused`, `subscription_cancelled`, `subscription_renewed`, `subscription_skip_requested`, `autoship_discount_applied` |

## 7.10 Recordatorios de vacunas, medicamentos y grooming

| Campo | Detalle |
|-------|---------|
| **Descripción** | Notificaciones automáticas para cuidado preventivo basadas en el perfil de la mascota. |
| **Valor para el usuario** | Nunca más olvidar una vacuna o desparasitación. Mi mascota siempre al día. |
| **Lógica de negocio** | Al registrar vacuna con fecha de próxima dosis → crear reminder automático. Recordatorios configurables: 7 días antes, 3 días, 1 día, día mismo. Tipos: vacuna, desparasitación, medicamento (diario/semanal), grooming (cada X semanas), chequeo veterinario (anual). Push notification + in-app badge. |
| **Reglas** | Recordatorios solo para mascotas activas. Máximo 3 notificaciones por recordatorio (no spam). Usuario puede silenciar un recordatorio específico. Recordatorios de medicamentos: horario configurable (mañana/tarde/noche). |
| **Edge cases** | Múltiples mascotas con recordatorios el mismo día → agrupar en una notificación. Vacuna sin fecha de próxima dosis → no crear reminder, pero sugerir completar. Zona horaria del usuario para enviar push en horario adecuado. |
| **Eventos analíticos** | `reminder_created`, `reminder_triggered`, `reminder_dismissed`, `reminder_action_taken` (e.g., agendó vacuna), `reminder_snoozed` |

## 7.11 Historial de reservas y órdenes

| Campo | Detalle |
|-------|---------|
| **Descripción** | Registro completo de todos los servicios y compras del usuario, accesible y filtrable. |
| **Valor para el usuario** | Ver todo lo que he contratado/comprado, re-reservar fácilmente, tener comprobantes. |
| **Lógica de negocio** | Dos secciones: "Mis reservas" (servicios) y "Mis pedidos" (productos). Cada entrada muestra: fecha, proveedor/tienda, mascota, monto, estado, acciones (re-reservar, review, soporte). Filtros: por estado, fecha, tipo de servicio. "Reservar de nuevo" con datos pre-llenados. |
| **Reglas** | Historial permanente (no se borra). Servicios cancelados se muestran con estado "Cancelado" y monto reembolsado. Máximo 50 items por página con paginación. |
| **Edge cases** | Proveedor eliminó su cuenta → mostrar "Proveedor ya no disponible". Producto descontinuado → mostrar pero sin opción de recompra. |
| **Eventos analíticos** | `booking_history_viewed`, `order_history_viewed`, `rebook_initiated`, `order_reorder_initiated` |

## 7.12 Carrito de compras

| Campo | Detalle |
|-------|---------|
| **Descripción** | Carrito persistente para compras en el marketplace de productos. |
| **Valor para el usuario** | Agregar múltiples productos y comprar todo junto. |
| **Lógica de negocio** | Carrito persiste entre sesiones (guardado en BD si logueado, localStorage si no). Validación de stock al agregar y al hacer checkout. Agregar/quitar items, ajustar cantidad. Mostrar subtotal, descuentos, envío, total. Cupón aplicable. Si item de autoship → mostrar precio regular vs suscripción. |
| **Reglas** | Máx. 20 items distintos. Cantidad máx. por item: 10. Carrito expira si inactivo 30 días. Si stock cambia entre agregar y checkout → notificar. |
| **Edge cases** | Producto agotado después de agregar → marcar como "sin stock" en carrito, no bloquear checkout del resto. Precio cambió → mostrar precio actualizado con aviso. Múltiples sellers en un carrito → órdenes separadas por seller. |
| **Eventos analíticos** | `cart_item_added`, `cart_item_removed`, `cart_viewed`, `cart_abandoned`, `checkout_initiated`, `checkout_completed` |

## 7.13 Favoritos

| Campo | Detalle |
|-------|---------|
| **Descripción** | Guardar proveedores y productos favoritos para acceso rápido. |
| **Valor para el usuario** | Encontrar rápido a mi paseador o producto preferido. |
| **Lógica de negocio** | Toggle de corazón en cards de proveedores y productos. Lista de favoritos accesible desde perfil. Favoritos separados: "Mis proveedores" y "Mis productos". Notificación opcional cuando un proveedor favorito tiene disponibilidad o un producto favorito está en oferta. |
| **Reglas** | Sin límite de favoritos. Favoritos no visibles públicamente. |
| **Edge cases** | Proveedor/producto eliminado → remover de favoritos silenciosamente. |
| **Eventos analíticos** | `favorite_added`, `favorite_removed`, `favorites_list_viewed`, `booked_from_favorites` |

## 7.14 Cupones / Promos

| Campo | Detalle |
|-------|---------|
| **Descripción** | Sistema de descuentos por código, automáticos y campañas promocionales. |
| **Valor para el usuario** | Ahorrar en servicios y productos. |
| **Lógica de negocio** | Tipos: código ingresado manualmente, automático (primera compra, cumpleaños mascota), referido. Descuento: % o monto fijo. Aplicable a: servicios, productos, categoría específica, proveedor específico. Reglas: uso único/múltiple, vigencia, monto mínimo, máximo de descuento. |
| **Reglas** | 1 cupón por transacción. No acumulable con autoship discount (se aplica el mayor). Cupones de referido: X% para referidor + Y% para referido. Admin configura desde backoffice. |
| **Edge cases** | Cupón expirado → mensaje claro "Cupón vencido". Cupón no aplicable al carrito → explicar por qué. Cupón ya usado → "Ya utilizaste este cupón". |
| **Eventos analíticos** | `coupon_applied`, `coupon_failed`, `coupon_created` (admin), `referral_coupon_generated`, `referral_coupon_redeemed` |

## 7.15 Loyalty / Fidelización

| Campo | Detalle |
|-------|---------|
| **Descripción** | Programa de puntos por actividad en la plataforma, canjeables por descuentos. |
| **Valor para el usuario** | Recompensa por usar PetMatch regularmente. Incentivo para no irse a la competencia. |
| **Lógica de negocio** | Ganar puntos por: completar booking (10 pts/USD), comprar productos (5 pts/USD), dejar review (50 pts), referir usuario (500 pts), completar perfil mascota (100 pts). Canjear: 1000 pts = USD 5 de descuento. Niveles: Bronce (0-999), Plata (1000-4999), Oro (5000+). Beneficios por nivel: Plata (envío gratis), Oro (5% extra descuento + prioridad soporte). |
| **Reglas** | Puntos expiran a los 12 meses de inactividad. Puntos no transferibles. Canje mínimo: 500 pts. Si se reembolsa un servicio/producto → se restan los puntos ganados. |
| **Edge cases** | Puntos ganados en servicio disputado → congelar hasta resolución. Nivel downgrade si puntos expiran → notificar 30 días antes. |
| **Eventos analíticos** | `points_earned`, `points_redeemed`, `loyalty_level_changed`, `points_expired` |

## 7.16 Soporte in-app

| Campo | Detalle |
|-------|---------|
| **Descripción** | Canal de soporte integrado con chatbot + escalamiento a agente humano. |
| **Valor para el usuario** | Resolver problemas sin salir de la app. Respuesta rápida. |
| **Lógica de negocio** | Nivel 1: FAQ y chatbot automático (respuestas a preguntas frecuentes). Nivel 2: chat con agente humano (horario laboral). Nivel 3: escalamiento a supervisor (disputas, emergencias). Tickets vinculados a bookings/órdenes para contexto. SLA: primera respuesta <2h en horario laboral, <8h fuera de horario. |
| **Reglas** | Todos los usuarios pueden acceder a soporte. Prioridad: emergencia > disputa > consulta general. Historial de tickets accesible para el usuario. |
| **Edge cases** | Fuera de horario → chatbot + ticket para respuesta al día siguiente. Saturación de agentes → cola con tiempo estimado. Usuario abusivo → warning → ban temporal de soporte. |
| **Eventos analíticos** | `support_ticket_created`, `support_chatbot_resolved`, `support_escalated_to_agent`, `support_ticket_resolved`, `support_csat_submitted` |

## 7.17 Centro de confianza y seguridad

| Campo | Detalle |
|-------|---------|
| **Descripción** | Hub de información sobre medidas de seguridad, verificaciones y garantías de la plataforma. |
| **Valor para el usuario** | Entender qué hace PetMatch para proteger a mi mascota y a mí. Generar confianza antes de la primera reserva. |
| **Lógica de negocio** | Página estática + dinámico: explicación de verificaciones, garantía PetMatch (reembolso si algo sale mal), seguro de responsabilidad (si aplica), protocolos de emergencia, cómo reportar, cómo funciona el rating. Sección dinámica: badges del proveedor, verificaciones completadas. |
| **Contenido** | "Cómo verificamos proveedores", "Nuestra garantía", "Qué hacer en emergencia", "Cómo funcionan los pagos seguros", "Política de cancelación", "Cómo reportar un problema", "Privacidad y datos" |
| **Reglas** | Visible para todos (incluso no logueados). Link desde perfil de cada proveedor. Link desde flujo de booking (antes de pagar). |
| **Edge cases** | N/A — es informativo. |
| **Eventos analíticos** | `trust_center_viewed`, `trust_center_section_viewed`, `trust_center_viewed_before_first_booking` |

---

# 8. MODELO DE MONETIZACIÓN

## 8.1 Revenue streams

### Modelo principal: Comisiones por transacción

| Stream | Tasa | Quién paga | Fase |
|--------|------|------------|------|
| Comisión por servicio (paseo, sitting, etc.) | 15% del monto del servicio | Proveedor (descontado del payout) | MVP |
| Fee de servicio al dueño | 7% del monto del servicio | Dueño (agregado al precio) | MVP |
| Comisión por venta de producto | 12% del precio del producto | Seller (descontado del payout) | V2 |
| Fee de tele-vet por consulta | 20% del precio de consulta | Vet (descontado del payout) | V2 |
| Fee de urgencia tele-vet | USD 5 adicional | Dueño | V2 |

**Take rate total estimado en servicios: ~22%** (15% proveedor + 7% dueño)
**Take rate total estimado en productos: ~12%**
**Take rate total estimado en tele-vet: ~20%**

### Modelo secundario: Suscripciones y recurrencia

| Stream | Precio | Beneficios | Fase |
|--------|--------|------------|------|
| PetMatch Premium (mensual) | USD 9.99/mes | 2 tele-vet gratis/mes, envío gratis en productos, 10% descuento en servicios, prioridad soporte, report cards con video | V2 |
| PetMatch Premium (anual) | USD 89.99/año (~USD 7.50/mes) | Igual que mensual + 1 chequeo vet anual | V2 |
| Fee proveedor destacado | USD 19.99/mes | Posición preferente en búsquedas, badge "Destacado", analytics avanzados | V2 |
| Suscripción autoship | Margen del descuento (5-15%) lo absorbe el seller | Recurrencia garantizada para el seller | V2 |

### Streams adicionales (V3+)

| Stream | Modelo | Fase |
|--------|--------|------|
| Anuncios / placement patrocinado | CPM/CPC para marcas en feed de productos | V3 |
| Alianzas con marcas | Fee fijo por campaña de sampling/co-marketing | V3 |
| Membresía empresarial (employee benefits) | USD 3-5/empleado/mes para empresas que ofrecen beneficio pet | V3 |
| Planes de salud pet | USD 15-25/mes (vacunas + desparasitación + 1 chequeo + descuento farmacia) | V3 |
| Data insights para marcas | Reportes anónimos de consumo por raza/ciudad/segmento | V3 |

## 8.2 Unit economics estimados (MVP - servicios)

**Supuestos:**
- Ticket promedio de servicio: USD 15 (paseo 1h)
- Servicios por usuario activo/mes: 4
- CAC: USD 8 (referral + digital)
- Churn mensual: 10%

| Métrica | Valor |
|---------|-------|
| GMV por usuario/mes | USD 60 |
| Revenue por usuario/mes (take rate 22%) | USD 13.20 |
| LTV (10 meses promedio) | USD 132 |
| CAC | USD 8 |
| LTV/CAC | 16.5x |
| Margen bruto (post Stripe fees 2.9%) | ~85% |
| Margen contribución | ~USD 11/usuario/mes |

## 8.3 Riesgos del modelo

| Riesgo | Mitigación |
|--------|------------|
| Desintermediación (dueño y paseador se van a WhatsApp) | Tracking, report cards, pagos seguros y garantía solo en plataforma. Valor agregado > fee. |
| Competencia de precio | Diferenciación por confianza y features, no por precio. |
| Márgenes bajos en e-commerce | Autoship genera volumen predecible. Comisión baja (12%) pero alto volumen. |
| Baja conversión a Premium | Ofrecer trial de 1 mes gratis. Anclar valor en tele-vet (una consulta ya vale más que la suscripción). |
| Dependencia de Stripe fees | Negociar volumen. Explorar pasarelas locales con menor fee. |

---

# 9. CONFIANZA, SEGURIDAD Y OPERACIONES

## 9.1 Verificación de identidad

| Nivel | Qué se verifica | Cómo | Obligatorio |
|-------|----------------|------|-------------|
| Nivel 1: Email | Email válido | Link de verificación | Sí (registro) |
| Nivel 2: Teléfono | Número real | SMS OTP | Sí (primer booking) |
| Nivel 3: Identidad | Cédula/RUT/DNI | Upload de documento + selfie + match automático (OCR) | Sí (proveedores), opcional (dueños) |
| Nivel 4: Antecedentes | Sin antecedentes penales | Integración con registro civil/policial del país (o declaración jurada + verificación manual) | Sí (paseadores, cuidadores, hospedaje) |

## 9.2 Validación de veterinarios

```
1. Verificación de título profesional (cédula profesional / registro del colegio veterinario)
2. Verificación de matrícula habilitante vigente
3. Verificación de identidad (Nivel 3)
4. Entrevista breve por video (10 min) con equipo médico de PetMatch
5. Firma de acuerdo de prácticas y ética
6. Re-validación anual de matrícula
```

## 9.3 Validación de sellers

```
1. Registro mercantil o patente comercial
2. Certificados sanitarios para alimentos y farmacia
3. Verificación de identidad del representante legal
4. Inspección de catálogo (productos legítimos, no falsificados)
5. Acuerdo de calidad y devoluciones
6. Monitoreo continuo de reviews y reclamos
```

## 9.4 Sistema de reviews

| Regla | Detalle |
|-------|---------|
| Quién puede dejar review | Solo usuarios con booking completado o compra entregada |
| Cuándo | Hasta 14 días después de completar el servicio/recibir producto |
| Editable | Hasta 48h después de publicar |
| Respuesta del proveedor | 1 respuesta pública por review |
| Moderación | Automática (keywords, spam) + manual si es reportada |
| Review con rating ≤ 2 | Trigger automático para revisión de Trust & Safety |
| Reviews falsas | Detección por patrones (múltiples reviews desde misma IP, texto copiado, timing sospechoso) → eliminación + sanción |
| Peso en ranking | Reviews recientes pesan más. Reviews de usuarios verificados pesan más. |

## 9.5 Sistema anti-fraude

| Tipo de fraude | Detección | Acción |
|----------------|-----------|--------|
| Paseador que no realiza el paseo | Sin datos de tracking GPS, check-in lejos de la dirección | Alerta automática, investigación, posible reembolso |
| Reviews falsas (compradas) | Patrones de texto, timing, IPs, cuentas nuevas | Eliminación + warning/ban |
| Cuentas duplicadas | Mismo email, teléfono, IP, device fingerprint | Bloqueo de la duplicada |
| Desintermediación | Compartir datos de contacto en chat | Warning automático (primer vez), suspensión (reincidencia) |
| Productos falsificados | Reports de usuarios, auditoría de sellers | Retiro del producto, suspensión del seller |
| Chargebacks fraudulentos | Stripe Radar + historial del usuario | Disputar con evidencia, ban si patrón |

## 9.6 Seguro / Garantía / Cobertura

**Garantía PetMatch (MVP):**
- Si el paseador no se presenta: reembolso 100% + crédito de USD 5.
- Si el servicio no fue satisfactorio (con evidencia): reembolso parcial o total a criterio de soporte.
- Cobertura máxima por incidente: USD 500 (MVP), escalable con seguro externo.

**Seguro de responsabilidad (V2):**
- Asociación con aseguradora para cubrir daños a la mascota durante servicios.
- Cobertura: gastos veterinarios por lesión durante servicio, hasta USD 2.000.
- Incluido en fee de servicio (costo absorbido por plataforma).

## 9.7 Protocolos de emergencia

```
NIVEL 1 — Incidente menor:
- Mascota regresa sucia, algo cansada, rasguño menor
- Acción: Report card detallada, disculpa del proveedor, crédito al dueño
- Responsable: Soporte nivel 1

NIVEL 2 — Incidente moderado:
- Mascota se escapa brevemente pero es recuperada, pelea menor con otro animal
- Acción: Alerta inmediata al dueño, investigación, posible suspensión del proveedor
- Responsable: Trust & Safety

NIVEL 3 — Emergencia:
- Mascota herida, perdida, o emergencia médica
- Acción inmediata:
  1. Notificación al dueño (llamada + push)
  2. Contactar vet de emergencia más cercano
  3. Activar cobertura/garantía
  4. Documentar con fotos y ubicación
  5. Suspensión preventiva del proveedor
  6. Investigación completa en 24h
  7. Reembolso total + cobertura de gastos vet
- Responsable: Trust & Safety + Management
```

## 9.8 Manejo de incidentes

```
1. Usuario reporta incidente (botón "Reportar problema" en booking)
2. Categorización automática: menor / moderado / emergencia
3. Si emergencia → escalamiento inmediato (ver protocolo)
4. Si menor/moderado:
   a. Ticket creado con contexto (booking, usuarios, tracking, mensajes)
   b. Agente contacta a ambas partes en <2h
   c. Recopilación de evidencia
   d. Decisión: reembolso / crédito / sin acción / sanción al proveedor
   e. Comunicación de resolución a ambas partes
   f. Registro en historial del proveedor (afecta trust score)
5. Si patrón de incidentes en mismo proveedor (3+ en 30 días) → revisión profunda → posible suspensión
```

## 9.9 Soporte escalonado

| Nivel | Canal | Horario | SLA primera respuesta |
|-------|-------|---------|----------------------|
| Nivel 0 | FAQ + Chatbot | 24/7 | Inmediato |
| Nivel 1 | Chat con agente | Lun-Sáb 8am-10pm | < 2 horas |
| Nivel 2 | Especialista (disputas, verificación) | Lun-Vie 9am-7pm | < 4 horas |
| Nivel 3 | Supervisor + T&S | Lun-Vie 9am-7pm + on-call | < 1 hora (emergencias) |

## 9.10 Políticas de cancelación y no-show

| Escenario | Política |
|-----------|----------|
| Dueño cancela >48h antes | Reembolso 100% |
| Dueño cancela 24-48h antes | Reembolso 50% |
| Dueño cancela <24h antes | Sin reembolso (proveedor recibe 50%) |
| Dueño no-show | Sin reembolso (proveedor recibe 100%) |
| Proveedor cancela (cualquier momento) | Reembolso 100% al dueño + penalización al proveedor (afecta ranking) |
| Proveedor no-show | Reembolso 100% + crédito USD 10 al dueño + suspensión temporal proveedor |
| 3 cancelaciones de proveedor en 30 días | Suspensión automática, revisión de Trust & Safety |

## 9.11 Protección de datos y documentos de salud

| Medida | Detalle |
|--------|---------|
| Encriptación en tránsito | TLS 1.3 en todas las conexiones |
| Encriptación en reposo | AES-256 para datos sensibles (documentos médicos, pagos) |
| Acceso a datos médicos | Solo el dueño y vets autorizados por el dueño |
| Retención de datos | Documentos médicos: indefinido. Tracking GPS: 30 días. Mensajes: 1 año. |
| GDPR/LGPD compliance | Derecho a descarga de datos, derecho al olvido, consentimiento explícito |
| PCI DSS | Delegado a Stripe (no almacenamos datos de tarjeta) |
| Backups | Diario, retención 30 días, offsite |

---

# 10. UX / UI

## 10.1 Arquitectura de información

```
PetMatch
├── Home (feed personalizado)
│   ├── Acciones rápidas (Buscar paseador, Comprar, Consultar vet)
│   ├── Mis mascotas (resumen)
│   ├── Próximos recordatorios
│   ├── Reservas activas
│   └── Productos recomendados
├── Servicios
│   ├── Búsqueda con mapa
│   ├── Filtros
│   ├── Listado de proveedores
│   ├── Perfil de proveedor
│   ├── Reservar servicio
│   └── Tracking en vivo
├── Tienda (V2)
│   ├── Categorías
│   ├── Búsqueda de productos
│   ├── Ficha de producto
│   ├── Carrito
│   ├── Checkout
│   └── Mis pedidos
├── Salud
│   ├── Mis mascotas (perfiles completos)
│   ├── Recordatorios
│   ├── Historial médico
│   ├── Tele-vet (V2)
│   └── Documentos
├── Chat
│   ├── Conversaciones
│   └── Mensajes
├── PetMatch (matching)
│   ├── Swipe
│   └── Matches
├── Perfil
│   ├── Mi cuenta
│   ├── Métodos de pago
│   ├── Direcciones
│   ├── Favoritos
│   ├── Historial
│   ├── Suscripciones
│   ├── Loyalty / puntos
│   ├── Ajustes
│   └── Ayuda / Soporte
└── Admin (rol admin)
    ├── Dashboard
    ├── Usuarios
    ├── Proveedores
    ├── Bookings
    ├── Productos
    ├── Reportes
    └── Configuración
```

## 10.2 Navegación mobile (Tab bar — 5 tabs)

```
[ 🏠 Home ] [ 🔍 Servicios ] [ 🛒 Tienda ] [ ❤️ Salud ] [ 👤 Perfil ]
```

- **Home**: Feed personalizado, acciones rápidas, resumen de mascotas
- **Servicios**: Búsqueda, mapa, reservas
- **Tienda**: Marketplace de productos (V2, mostrar "Próximamente" en MVP)
- **Salud**: Mascotas, recordatorios, historial, tele-vet
- **Perfil**: Cuenta, config, historial, puntos, soporte

**Accesos flotantes:**
- FAB de chat (esquina inferior derecha, sobre tab bar)
- Badge de notificaciones en header
- PetMatch (matching) accesible desde Home o Perfil

## 10.3 Navegación web (Header + sidebar)

**Header:**
```
[Logo PetMatch] [Buscar...] [Servicios] [Tienda] [Salud] [🔔] [💬] [Avatar ▾]
```

**Sidebar (dashboard):**
```
📊 Dashboard
🐾 Mis mascotas
📅 Mis reservas
📦 Mis pedidos
💊 Salud y recordatorios
⭐ Favoritos
💳 Pagos
🎁 Puntos y beneficios
⚙️ Configuración
❓ Ayuda
```

## 10.4 Principios de diseño

1. **Mobile-first**: diseñar para mobile, adaptar a web (no al revés).
2. **Confianza visual**: badges de verificación prominentes, ratings visibles, fotos reales.
3. **Mínima fricción**: booking en 3 taps, compra en 4 taps, tele-vet en 2 taps.
4. **Personalización**: todo gira alrededor de MI mascota (nombre, foto, recomendaciones).
5. **Claridad de precios**: precio total visible antes de pagar, sin sorpresas.
6. **Feedback constante**: estados claros (pendiente → confirmado → en progreso → completado).
7. **Accesibilidad**: contraste WCAG AA, tamaños de tap target ≥ 44px, textos legibles.
8. **Dual marketplace sin confusión**: separar visualmente servicios (personas que hacen algo por tu mascota) de tienda (productos que compras). No mezclar en un mismo listado.

## 10.5 Cómo resolver dual marketplace + e-commerce sin confusión

**Estrategia:** Separación clara en la navegación principal (tabs distintos) + unificación en el contexto de la mascota.

- **Servicios** y **Tienda** son tabs separados → el usuario entiende que son cosas distintas.
- Desde el **perfil de mascota**, se ven ambos: "Servicios recomendados para Luna" + "Productos recomendados para Luna" → unificados por contexto.
- **Home** muestra ambos en secciones separadas y etiquetadas: "Encuentra un cuidador" y "Tienda para [mascota]".
- Visualmente: servicios usan cards con foto de persona + rating + precio/hora. Productos usan cards con foto de producto + precio + "Agregar al carrito".
- Colores diferenciados sutilmente: servicios = azul/verde (confianza, naturaleza), tienda = naranja/amarillo (acción, compra).

## 10.6 Pantallas mobile (20 pantallas priorizadas)

| # | Pantalla | Prioridad | Fase |
|---|----------|-----------|------|
| 1 | Home / Feed personalizado | P0 | MVP |
| 2 | Búsqueda de servicios (mapa + lista) | P0 | MVP |
| 3 | Perfil de proveedor | P0 | MVP |
| 4 | Reservar servicio (wizard 3 pasos) | P0 | MVP |
| 5 | Tracking en vivo del paseo | P0 | MVP |
| 6 | Perfil de mascota (ver/editar) | P0 | MVP |
| 7 | Mis reservas (lista + detalle) | P0 | MVP |
| 8 | Chat (lista + conversación) | P0 | MVP |
| 9 | Report card del servicio | P0 | MVP |
| 10 | Onboarding (registro + agregar mascota) | P0 | MVP |
| 11 | Catálogo de productos (browse + buscar) | P1 | V2 |
| 12 | Ficha de producto | P1 | V2 |
| 13 | Carrito + Checkout | P1 | V2 |
| 14 | Tele-vet (solicitar + sala de espera + video) | P1 | V2 |
| 15 | Recordatorios y salud | P1 | V2 |
| 16 | Perfil de usuario / Mi cuenta | P1 | MVP |
| 17 | Favoritos | P2 | V2 |
| 18 | Loyalty / Mis puntos | P2 | V2 |
| 19 | PetMatch swipe (matching) | P2 | MVP (ya existe) |
| 20 | Soporte / Ayuda | P2 | V2 |

## 10.7 Pantallas web (15 pantallas priorizadas)

| # | Pantalla | Prioridad | Fase |
|---|----------|-----------|------|
| 1 | Landing page (público) | P0 | MVP |
| 2 | Dashboard dueño | P0 | MVP |
| 3 | Búsqueda de servicios | P0 | MVP |
| 4 | Perfil de proveedor + booking | P0 | MVP |
| 5 | Provider portal - Dashboard | P0 | MVP |
| 6 | Provider portal - Gestión de servicios y agenda | P0 | MVP |
| 7 | Provider portal - Bookings | P0 | MVP |
| 8 | Admin - Dashboard con métricas | P0 | MVP |
| 9 | Admin - Gestión de usuarios y proveedores | P0 | MVP |
| 10 | Admin - Moderación y reportes | P0 | MVP |
| 11 | Catálogo de productos | P1 | V2 |
| 12 | Seller portal | P1 | V2 |
| 13 | Vet portal | P1 | V2 |
| 14 | Admin - Gestión de catálogo y órdenes | P1 | V2 |
| 15 | Centro de confianza y seguridad | P1 | V2 |

## 10.8 Componentes reutilizables (10 componentes clave)

| # | Componente | Uso |
|---|------------|-----|
| 1 | `<ProviderCard>` | Cards de proveedores en búsqueda, favoritos, recomendaciones |
| 2 | `<ProductCard>` | Cards de productos en catálogo, recomendaciones, carrito |
| 3 | `<PetProfileCard>` | Mini perfil de mascota en booking, servicios, salud |
| 4 | `<BookingStatusBadge>` | Badge de estado (pendiente, confirmado, en progreso, completado, cancelado) |
| 5 | `<RatingStars>` | Estrellas de rating (input y display) en reviews, cards, perfiles |
| 6 | `<MapView>` | Mapa interactivo para búsqueda de servicios y tracking |
| 7 | `<ChatBubble>` | Mensajes de chat (texto, fotos, sistema) |
| 8 | `<ReportCard>` | Report card del servicio (estado, fotos, métricas) |
| 9 | `<ReminderCard>` | Tarjeta de recordatorio (vacuna, medicamento, grooming) |
| 10 | `<VerificationBadge>` | Badge de verificación (identidad, antecedentes, super provider) |

---

# 11. ROADMAP DE PRODUCTO

## Fase 0: Discovery (Semanas 1-4)

| Campo | Detalle |
|-------|---------|
| **Objetivos** | Validar demanda, definir ciudad piloto, reclutar primeros proveedores, diseñar UI/UX del MVP |
| **Entregables** | 30 entrevistas con dueños de mascotas, 15 entrevistas con paseadores/cuidadores, análisis de competencia local, wireframes de flujos core, diseño de marca y UI kit, plan de captación de supply |
| **Dependencias** | Equipo mínimo (1 product, 1 designer, 1 founder), presupuesto de research |
| **Riesgos** | Descubrir que el mercado es más pequeño de lo esperado. Proveedores no quieren formalizarse. Saturación local. |
| **Métricas de éxito** | 30+ entrevistas completadas, 20+ proveedores interesados (letter of intent), problema validado con 80%+ de entrevistados, wireframes aprobados |

## Fase 1: MVP (Semanas 5-16)

| Campo | Detalle |
|-------|---------|
| **Objetivos** | Lanzar marketplace de servicios con verificación, tracking y pagos en 1 ciudad |
| **Features** | Auth mejorado (verificación email + teléfono), perfil de mascota ampliado (salud básica, comportamiento), búsqueda de servicios por mapa + filtros, perfiles de proveedores con verificación (identidad + antecedentes), booking con calendario de disponibilidad, pagos con Stripe Connect (split + payouts), tracking GPS de paseos en vivo, check-in/check-out con geoloc, report cards post-servicio, chat mejorado (fotos), sistema de reviews con sub-ratings, recordatorios básicos (vacunas, desparasitación), políticas de cancelación y reembolso, admin panel mejorado (verificación de proveedores, moderación), landing page optimizada para conversión |
| **Dependencias** | Diseños UI aprobados, Stripe Connect configurado, Google Maps API, 50+ proveedores onboarded pre-lanzamiento, soporte nivel 1 operativo |
| **Riesgos** | No alcanzar masa crítica de proveedores. Tracking GPS drena batería. Incidentes con mascotas sin protocolo maduro. Stripe Connect onboarding complejo para proveedores. |
| **Métricas de éxito** | 500 usuarios registrados (M1), 50 proveedores activos, 200 bookings completados (M1), rating promedio >4.5, <5% tasa de incidentes, <3% churn semanal de proveedores |

## Fase 2: Expansión funcional (Semanas 17-32)

| Campo | Detalle |
|-------|---------|
| **Objetivos** | Agregar e-commerce, tele-vet, autoship y membresía premium |
| **Features** | Marketplace de productos (catálogo, carrito, checkout, órdenes), seller portal (onboarding, inventario, analytics), tele-veterinaria (video, chat, prescripción digital), autoship / suscripción de recompra, PetMatch Premium (membresía), recordatorios avanzados (medicamentos, grooming), ficha médica completa con documentos, loyalty points (versión básica), cupones y promos, soporte in-app (chatbot + agente), centro de confianza y seguridad, favoritos y wishlist |
| **Dependencias** | MVP estable con tracción probada, sellers onboarded (mín. 10 tiendas), vets onboarded (mín. 5 veterinarios), logística/fulfillment partner, plataforma de video (Twilio/Daily.co) |
| **Riesgos** | Complejidad de catálogo + fulfillment. Vets no adoptan la plataforma. Premium no convierte. Feature bloat que degrada UX. |
| **Métricas de éxito** | 2.000 usuarios activos mensuales, 500 compras de productos/mes, 100 consultas tele-vet/mes, 200 suscripciones autoship activas, 5% conversión a Premium, GMV USD 50K/mes |

## Fase 3: Growth y retención (Semanas 33-52)

| Campo | Detalle |
|-------|---------|
| **Objetivos** | Escalar usuarios y proveedores, optimizar retención, expandir a 2-3 ciudades |
| **Features** | Programa de referidos con incentivos, notificaciones inteligentes (ML básico), recomendaciones personalizadas (por raza, historial de compras), SEO y contenido (blog de salud pet), integraciones con Google Calendar, app mobile nativa (React Native o Expo), analytics avanzados para admin, A/B testing framework, API pública para partners |
| **Dependencias** | Product-market fit validado en ciudad 1, equipo de growth (marketing + data), budget para CAC en nuevas ciudades, playbook de expansión a nueva ciudad |
| **Riesgos** | Unit economics no sostienen expansion. CAC sube en nuevas ciudades. Equipo no escala. Competidores copian features. |
| **Métricas de éxito** | 10.000 MAU, 3 ciudades activas, 500 proveedores activos total, retención M3 >40%, LTV/CAC >5x, GMV USD 200K/mes |

## Fase 4: Super-app / Ecosistema (Año 2)

| Campo | Detalle |
|-------|---------|
| **Objetivos** | Convertirse en el sistema operativo de la mascota con ecosistema completo |
| **Features** | Módulo de entrenamiento (videos + entrenadores), GPS / safety (integración collares, QR, mascota perdida), planes de salud (suscripción: vacunas + desparasitación + chequeo), seguro pet (alianza con aseguradora), employee benefits pet (B2B), anuncios y placements patrocinados, data insights para marcas, API avanzada para integraciones (clínicas, pet shops) |
| **Dependencias** | Base sólida de usuarios y proveedores, partnerships con aseguradoras y marcas, equipo de BD, infraestructura escalable |
| **Riesgos** | Perder foco por hacer demasiado. Partners no cierran. Regulación (telemedicina, seguros). |
| **Métricas de éxito** | 50.000 MAU, revenue mensual USD 500K+, 3+ revenue streams activos, 10+ partners B2B, NPS >60 |

## Fase 5: Expansión geográfica (Año 2-3)

| Campo | Detalle |
|-------|---------|
| **Objetivos** | Expandir a 3+ países de LATAM y preparar entrada a otros mercados |
| **Features** | Multi-moneda y multi-idioma, adaptación regulatoria por país, partnerships locales (pasarelas de pago, logística, vets), operaciones locales (soporte, trust & safety), localización de catálogo y proveedores |
| **Dependencias** | Playbook de expansión probado en múltiples ciudades, levantamiento de capital (Serie A), equipo regional, legal por país |
| **Riesgos** | Regulación varía mucho por país. Competidores locales establecidos. Costos de operación local. Diferencias culturales en cuidado pet. |
| **Métricas de éxito** | Presencia en 3+ países, 200.000 MAU regional, GMV USD 2M+/mes, path to profitability claro |

---

# 12. KPIs Y NORTH STAR

## 12.1 North Star Metric

> **Servicios completados con éxito por semana**

Justificación: un servicio completado implica que un dueño confió en la plataforma, un proveedor generó ingreso, hubo tracking/report card, hubo pago, y hay probabilidad alta de retención y review. Es la métrica que mejor correlaciona con valor generado para todos los stakeholders.

## 12.2 KPIs de marketplace de servicios

| KPI | Definición | Target MVP |
|-----|-----------|------------|
| Bookings completados/semana | Servicios finalizados exitosamente | 50/sem (M3) |
| Fill rate | % de búsquedas que resultan en booking | >15% |
| Tasa de aceptación | % de solicitudes aceptadas por proveedores | >80% |
| Tasa de completación | % de bookings confirmados que se completan | >95% |
| Tiempo de respuesta del proveedor | Tiempo promedio para aceptar/rechazar | <2h |
| Repeat booking rate | % de usuarios que reservan >1 vez | >40% (M3) |
| Ticket promedio | Monto promedio por booking | USD 15-20 |

## 12.3 KPIs de e-commerce

| KPI | Definición | Target V2 |
|-----|-----------|-----------|
| GMV productos/mes | Valor total de ventas de productos | USD 30K (M6) |
| Órdenes/día | Pedidos procesados por día | 20/día (M6) |
| Ticket promedio | Monto promedio por orden | USD 25-35 |
| Conversion rate | Visitantes de tienda que compran | >3% |
| Autoship activos | Suscripciones de recompra activas | 200 (M6) |
| Tasa de devolución | % de órdenes devueltas | <5% |

## 12.4 KPIs de salud

| KPI | Definición | Target |
|-----|-----------|--------|
| Perfiles de mascota completos (>80%) | % de mascotas con perfil de salud completo | >30% (MVP) |
| Recordatorios creados | Recordatorios activos totales | 500 (M3) |
| Recordatorios accionados | % de recordatorios que generan acción | >40% |
| Consultas tele-vet/semana | Videoconsultas completadas | 25/sem (V2 M3) |
| Tasa de resolución tele-vet | % resuelto sin derivación presencial | >70% |

## 12.5 KPIs de retención

| KPI | Definición | Target |
|-----|-----------|--------|
| Retención D7 | % de usuarios activos al día 7 | >50% |
| Retención M1 | % de usuarios activos al mes 1 | >35% |
| Retención M3 | % de usuarios activos al mes 3 | >25% |
| Retención M6 | % de usuarios activos al mes 6 | >20% |
| DAU/MAU ratio | Stickiness | >15% |
| Churn mensual | % de usuarios que dejan de usar | <12% |

## 12.6 KPIs de supply (proveedores)

| KPI | Definición | Target MVP |
|-----|-----------|------------|
| Proveedores activos | Proveedores con ≥1 booking en últimos 30 días | 50 (M3) |
| Proveedores verificados | % del total que pasó verificación completa | >90% |
| Ingresos promedio/proveedor/mes | Earnings del proveedor | USD 200+ |
| Churn de proveedores mensual | % que deja de ofrecer servicios | <5% |
| Tiempo promedio de onboarding | Desde registro hasta primer servicio | <7 días |
| Cobertura geográfica | % de zonas de la ciudad con >3 proveedores | >60% |

## 12.7 KPIs de confianza / soporte

| KPI | Definición | Target |
|-----|-----------|--------|
| Rating promedio global | Promedio de todas las reviews | >4.5 |
| Tasa de incidentes | % de servicios con reporte de incidente | <3% |
| CSAT soporte | Satisfacción con soporte | >85% |
| Tiempo primera respuesta | Tiempo medio de primera respuesta soporte | <2h |
| Tasa de resolución | % de tickets resueltos | >95% |
| Reportes de fraude confirmados | Incidentes de fraude confirmados/mes | <0.5% de transacciones |

## 12.8 KPIs unit economics

| KPI | Definición | Target |
|-----|-----------|--------|
| GMV total/mes | Volumen total de transacciones | USD 50K (M6) |
| Revenue/mes | Ingresos netos (comisiones + fees + suscripciones) | USD 11K (M6) |
| Take rate | Revenue / GMV | ~22% |
| CAC | Costo de adquirir un usuario | <USD 10 |
| LTV | Lifetime value del usuario | >USD 100 |
| LTV/CAC | Ratio | >10x |
| Payback period | Meses para recuperar CAC | <2 meses |
| Gross margin | (Revenue - COGS) / Revenue | >80% |
| Burn rate | Cash quemado por mes | <USD 15K (pre-funding) |

---

# 13. MODELO OPERATIVO

## 13.1 Captación de proveedores

**Estrategia por canal:**

| Canal | Tácticas | Costo estimado |
|-------|----------|----------------|
| Redes sociales | Ads en Instagram/Facebook segmentados: "paseadores de perros [ciudad]", grupos de pet care | USD 3-5 por lead |
| Presencial | Visitar parques, pet shops, clínicas y dejar flyers/QR. Asistir a ferias pet. | USD 500/mes |
| Referidos de proveedores | "Invita a un colega → ambos reciben bono de USD 20 al completar 5 servicios" | USD 20 por proveedor |
| Partnerships | Acuerdo con escuelas de grooming, asociaciones de paseadores | USD 0 (tradeoff visibilidad) |
| Outbound | Contacto directo en Instagram/Facebook a paseadores que ya ofrecen servicios | USD 0 (tiempo) |

**Meta MVP:** 50 proveedores verificados antes del lanzamiento público.

**Incentivo de lanzamiento:** 0% comisión los primeros 30 días (solo fee del dueño).

## 13.2 Onboarding y QA de proveedores

```
Flujo (target: <7 días de registro a primer servicio):
1. Registro online (15 min)
2. Upload de documentos (10 min)
3. Verificación automática + manual (24-48h)
4. Video-call de bienvenida (15 min) — explicar plataforma, expectativas, protocolos
5. Crear primer servicio con guía paso a paso
6. Primer booking supervisado (sin comisión)
7. Feedback + badge "Verificado" activado
```

**QA continua:**
- Review de proveedores con rating <4.0 cada mes
- Mystery shopper cada trimestre (booking real por parte del equipo)
- Auditoría de report cards (¿se están completando? ¿calidad de fotos?)
- Encuesta trimestral de satisfacción a proveedores

## 13.3 Pricing

**Servicios — precios sugeridos (no impuestos por la plataforma):**

| Servicio | Rango sugerido (USD) | Unidad |
|----------|---------------------|--------|
| Paseo (30 min) | 5-10 | por paseo |
| Paseo (1 hora) | 10-18 | por paseo |
| Sitting (visita de 1h) | 8-15 | por visita |
| Daycare (día completo) | 15-25 | por día |
| Boarding (pernocte) | 18-35 | por noche |
| Grooming básico | 15-30 | por sesión |
| Grooming completo | 25-50 | por sesión |

**El proveedor fija su precio.** PetMatch muestra rango del mercado como referencia.

**Pricing dinámico (V2):** surge pricing en fechas de alta demanda (feriados, vacaciones) — +15-30% sugerido automáticamente.

## 13.4 Disponibilidad

- Proveedor configura horario semanal recurrente (ej: Lun-Vie 8am-6pm)
- Puede bloquear días específicos
- Capacidad máxima configurable (ej: máx. 3 paseos simultáneos)
- Bookings automáticamente validan disponibilidad
- Buffer de 30 min entre servicios (configurable)
- Si proveedor no actualiza disponibilidad en 14 días → notificación "¿Sigues activo?"

## 13.5 Zonas geográficas

**MVP:** 1 ciudad (Santiago de Chile o Ciudad de México — ver sección 17).

**Configuración por zona:**
- Radio de cobertura del proveedor (1-25 km desde su ubicación base)
- Zonas de la ciudad definidas por polígonos en admin
- Métricas por zona: proveedores activos, demanda, fill rate
- Alertas si una zona tiene <3 proveedores activos

**Expansión:**
- Nueva zona dentro de la misma ciudad: cuando hay >10 solicitudes sin proveedor disponible
- Nueva ciudad: playbook estandarizado (captación previa de 30 proveedores, lanzamiento soft)

## 13.6 Customer support

**Equipo MVP:**
- 1 persona full-time (horario laboral) + founder on-call fuera de horario
- Herramienta: Intercom o Crisp (chat in-app + tickets + base de conocimiento)
- FAQ con 30+ artículos pre-escritos
- Chatbot con respuestas automáticas a top 10 preguntas
- Escalamiento: soporte → founder → decisión ejecutiva

**Escalar (V2+):**
- 2-3 agentes por turno
- Soporte en español 12h/día, 7 días
- SLA documentados
- Playbooks de resolución para cada tipo de incidente

## 13.7 Reembolsos (Reimbursements)

| Escenario | Reembolso | Método | Tiempo |
|-----------|-----------|--------|--------|
| Proveedor cancela | 100% | Automático a método original | Inmediato (wallet) / 5-10 días (tarjeta) |
| Dueño cancela >48h | 100% | Automático | Inmediato / 5-10 días |
| Dueño cancela 24-48h | 50% | Automático | Inmediato / 5-10 días |
| Servicio no satisfactorio | Caso a caso | Manual por soporte | 24-48h tras resolución |
| Producto defectuoso | 100% | Manual por soporte | 24-48h tras recibir devolución |
| Disputa | Según investigación | Manual | 3-5 días hábiles |

**Regla:** reembolsos <USD 25 → auto-aprobados por soporte nivel 1. >USD 25 → requiere aprobación de nivel 2.

## 13.8 Gestión de veterinarios

**Modelo:** veterinarios como freelancers (no empleados).

```
1. Vet se registra → verificación de título + matrícula (3-5 días)
2. Entrevista por video (10 min) con asesor médico de PetMatch
3. Configuración de disponibilidad para tele-vet
4. Tarifa fijada por el vet (PetMatch sugiere rango USD 10-25 por consulta)
5. Vet atiende consultas vía plataforma
6. Payout semanal (80% de la tarifa, 20% comisión PetMatch)
7. Evaluación trimestral: rating, tiempo promedio de consulta, resolución
```

**Vet a domicilio:** mismo modelo, el vet define zona de cobertura. Tarifa más alta (USD 30-50).

## 13.9 Catálogo de productos

**Modelo marketplace (V2):**
- Sellers suben sus propios productos (self-service)
- PetMatch NO mantiene inventario propio (marketplace puro)
- Categorías estandarizadas: Alimento (seco, húmedo, natural), Farmacia, Accesorios, Higiene, Juguetes, Camas, Ropa, Viaje
- Cada producto requiere: nombre, descripción, fotos (mín. 1, máx. 10), precio, variantes (peso/sabor/tamaño), stock, categoría, marca
- Moderación: productos nuevos revisados en <24h antes de publicarse
- Productos con >3 reportes → revisión automática

## 13.10 Fulfillment / Logística

**Modelo MVP (V2):**
- Fulfillment por el seller (seller ships). PetMatch NO toca el producto.
- Integración con servicios de delivery locales (Rappi, 99Minutos, Chilexpress, según país)
- Seller define: métodos de envío disponibles, costos, tiempos
- Tracking de envío integrado (número de seguimiento del courier)

**Futuro (V3):**
- Evaluar fulfillment propio o partnership con operador logístico
- Dark stores para productos de alta rotación (comida) y entrega en <2h

## 13.11 Integraciones con terceros

| Integración | Propósito | Fase |
|-------------|-----------|------|
| Stripe Connect | Pagos, split, payouts | MVP |
| Google Maps API | Mapas, búsqueda, tracking, geocoding | MVP |
| Cloudinary | Storage de fotos y documentos | MVP |
| Socket.io / Ably | Chat y tracking en tiempo real | MVP |
| Google OAuth | Login social | MVP (ya existe) |
| Apple Sign-In | Login social (iOS) | V2 |
| Twilio / Daily.co | Video para tele-vet | V2 |
| SendGrid / Resend | Emails transaccionales | MVP |
| OneSignal / Firebase | Push notifications | MVP |
| Google Calendar | Sync de agenda de proveedores | V2 |
| Intercom / Crisp | Soporte in-app | V2 |
| Segment / Mixpanel | Analytics de producto | MVP |
| Sentry | Error tracking | MVP |
| MercadoPago (LATAM) | Pagos locales alternativos a Stripe | V2 |
| Rappi / delivery partners | Fulfillment de productos | V2 |

---

# 14. ARQUITECTURA TÉCNICA

## 14.1 Stack recomendado (ya alineado con proyecto existente)

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend Web** | Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui | Ya implementado. App Router con SSR, server components, server actions. |
| **Frontend Mobile** | React Native (Expo) | Comparte lógica con web. Expo simplifica builds y OTA updates. Necesario para tracking GPS y push nativas. |
| **Backend** | Next.js API Routes + Server Actions | Ya implementado. Monolito modular suficiente para MVP-V2. |
| **Base de datos** | PostgreSQL (Neon o Supabase) | Ya soportado. Relacional, ACID, extensiones (PostGIS para geo). |
| **ORM** | Prisma 7 | Ya implementado. Type-safe, migraciones, seeding. |
| **Auth** | NextAuth 5 (Auth.js) | Ya implementado. JWT, Google OAuth, extensible con Apple/Facebook. |
| **Pagos** | Stripe Connect | Ya parcialmente implementado. Split payments, payouts, billing. |
| **Chat en tiempo real** | Socket.io (servidor Node.js separado) | Ya configurado en cliente. Implementar servidor. Alternativa: Ably/Pusher para managed. |
| **Mapas / Geolocalización** | Google Maps API + Google Places | Ya configurado. Búsqueda, mapas, tracking, geocoding. |
| **Video (tele-vet)** | Daily.co o Twilio Video | WebRTC managed. SDK para web y mobile. |
| **Storage** | Cloudinary | Ya configurado. Fotos, documentos, transformaciones de imagen. |
| **Push notifications** | Firebase Cloud Messaging (FCM) + OneSignal | FCM para Android/web, APNs via OneSignal para iOS. |
| **Email** | Resend o SendGrid | Transaccional: confirmaciones, recordatorios, payouts. |
| **Analytics** | Mixpanel o PostHog | Eventos de producto, funnels, retención. |
| **Error tracking** | Sentry | Errores en frontend y backend. |
| **Observabilidad** | Vercel Analytics + Sentry Performance | Métricas de rendimiento, Core Web Vitals. |
| **Hosting** | Vercel (web) + Railway o Render (socket server) | Vercel para Next.js (edge functions, ISR). Railway para servicios auxiliares. |
| **CI/CD** | GitHub Actions | Tests, lint, build, deploy automático. |

## 14.2 Stack alternativa low-cost

| Capa | Alternativa | Ahorro |
|------|-------------|--------|
| Base de datos | SQLite (Turso) o Supabase free tier | USD 0-25/mes vs Neon Pro |
| Chat | Supabase Realtime (PostgreSQL LISTEN/NOTIFY) | USD 0 vs Socket.io server |
| Video | Jitsi Meet (self-hosted, open source) | USD 0 vs Daily.co |
| Push | Firebase FCM directo (sin OneSignal) | USD 0 |
| Email | Resend free tier (3K emails/mes) | USD 0 |
| Analytics | PostHog self-hosted o Plausible | USD 0 vs Mixpanel |
| Hosting | Vercel free + Railway free tier | USD 0-10/mes |

**Costo total low-cost estimado: USD 20-50/mes** (MVP)
**Costo total recomendado estimado: USD 100-300/mes** (MVP con margen)

## 14.3 Arquitectura de alto nivel

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTES                            │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Web App  │  │ Mobile   │  │ Admin Panel (web)      │ │
│  │ (Next.js)│  │ (Expo)   │  │ (Next.js /admin)       │ │
│  └────┬─────┘  └────┬─────┘  └──────────┬─────────────┘ │
└───────┼──────────────┼───────────────────┼───────────────┘
        │              │                   │
        ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │           Next.js Server Actions + API Routes      │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐ │  │
│  │  │ Auth     │ Booking  │ Commerce │ Health       │ │  │
│  │  │ Module   │ Engine   │ Engine   │ Module       │ │  │
│  │  ├──────────┼──────────┼──────────┼──────────────┤ │  │
│  │  │ Payment  │ Search   │ Chat     │ Notification │ │  │
│  │  │ Engine   │ Engine   │ Module   │ Module       │ │  │
│  │  └──────────┴──────────┴──────────┴──────────────┘ │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL  │  │  Redis       │  │  Socket.io       │
│  (Neon)      │  │  (Cache +    │  │  Server          │
│              │  │   Queues)    │  │  (Chat +         │
│              │  │              │  │   Tracking)      │
└──────────────┘  └──────────────┘  └──────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│                 SERVICIOS EXTERNOS                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────────────┐  │
│  │ Stripe │ │ Google │ │Cloudi- │ │ FCM/OneSignal │  │
│  │Connect │ │ Maps   │ │ nary   │ │ (Push)        │  │
│  ├────────┤ ├────────┤ ├────────┤ ├───────────────┤  │
│  │Daily.co│ │ Resend │ │ Sentry │ │ Mixpanel      │  │
│  │(Video) │ │(Email) │ │(Errors)│ │ (Analytics)   │  │
│  └────────┘ └────────┘ └────────┘ └───────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 14.4 Entidades principales de base de datos

```
users ──┬── pets ──── pet_vaccines
        │         ├── pet_documents
        │         ├── pet_medications
        │         └── reminders
        │
        ├── provider_profiles ── provider_documents
        │                     ├── provider_badges
        │                     └── services ── service_availability
        │
        ├── seller_profiles ── products ── product_variants
        │                              └── product_reviews
        │
        ├── vet_profiles ── vet_appointments
        │                └── vet_prescriptions
        │
        ├── bookings ── booking_events
        │            ├── walk_tracking
        │            ├── report_cards
        │            ├── reviews
        │            └── payments ── payouts
        │
        ├── orders ── order_items
        │          └── payments
        │
        ├── carts ── cart_items
        │
        ├── subscriptions (autoship + premium)
        │
        ├── conversations ── messages
        │
        ├── favorites
        ├── loyalty_points
        ├── incidents
        └── notifications
```

## 14.5 Permisos por rol

| Recurso | OWNER | WALKER/GROOMER | VET | SELLER | ADMIN |
|---------|-------|----------------|-----|--------|-------|
| Ver/editar perfil propio | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRUD mascotas | ✅ | ❌ | ❌ | ❌ | ✅ (ver) |
| Buscar servicios | ✅ | ❌ | ❌ | ❌ | ✅ (ver) |
| Crear booking | ✅ | ❌ | ❌ | ❌ | ✅ |
| Gestionar servicios propios | ❌ | ✅ | ❌ | ❌ | ✅ |
| Aceptar/rechazar bookings | ❌ | ✅ | ❌ | ❌ | ✅ |
| Tracking GPS (enviar) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tracking GPS (ver) | ✅ (propio) | ❌ | ❌ | ❌ | ✅ |
| Gestionar productos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Atender tele-vet | ❌ | ❌ | ✅ | ❌ | ❌ |
| Prescribir | ❌ | ❌ | ✅ | ❌ | ❌ |
| Ver dashboard admin | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ban/suspender usuarios | ❌ | ❌ | ❌ | ❌ | ✅ |
| Moderar reviews/reportes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ver analytics globales | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configurar comisiones | ❌ | ❌ | ❌ | ❌ | ✅ |

## 14.6 Consideraciones de escalabilidad

| Área | Estrategia |
|------|-----------|
| Base de datos | PostgreSQL con read replicas cuando >10K usuarios. Índices en campos de búsqueda frecuente (user_id, pet_id, status, created_at, location). |
| API | Next.js con edge runtime para rutas de lectura. Server actions para writes. Rate limiting por IP y por usuario. |
| Tracking GPS | WebSocket server separado (Railway/Render). Si crece: migrar a Ably/Pusher (managed, auto-scale). |
| Búsqueda | PostgreSQL full-text search para MVP. Migrar a Elasticsearch/Meilisearch si >50K productos. |
| Geobúsqueda | PostGIS extension para queries geoespaciales eficientes. |
| Imágenes | Cloudinary con transformaciones on-the-fly. CDN incluido. |
| Cache | Redis para: sesiones, resultados de búsqueda frecuentes, contadores (likes, views). Vercel Edge Config para feature flags. |
| Background jobs | BullMQ + Redis para: payouts, recordatorios, emails, notificaciones push. |

## 14.7 Compliance

| Regulación | Acción |
|-----------|--------|
| GDPR / LGPD (Brasil) / Ley 19.628 (Chile) | Consentimiento explícito, derecho a descarga/eliminación, DPO designado |
| PCI DSS | Delegado a Stripe (nunca almacenamos datos de tarjeta) |
| Telemedicina veterinaria | Verificar regulación por país. En Chile y México: permitida con restricciones. |
| Protección al consumidor | Derecho a retracto, política de devoluciones clara, facturación electrónica |

---

# 15. ESQUEMA DE BASE DE DATOS

## 15.1 Tablas y columnas clave

### users
```
id                  String    @id @default(cuid())
name                String
email               String    @unique
emailVerified       DateTime?
phone               String?
phoneVerified       Boolean   @default(false)
image               String?
password            String?
role                Enum      (OWNER, WALKER, GROOMER, VET, SELLER, ADMIN)
status              Enum      (ACTIVE, SUSPENDED, BANNED)
address             String?
city                String?
country             String?
latitude            Float?
longitude           Float?
bio                 String?
notificationPrefs   Json?
createdAt           DateTime
updatedAt           DateTime
```

### pets
```
id                  String    @id
ownerId             String    → users.id
name                String
species             Enum      (DOG, CAT)
breed               String?
sex                 Enum      (MALE, FEMALE)
dateOfBirth         DateTime?
weight              Float?
size                Enum      (SMALL, MEDIUM, LARGE, XLARGE)
energyLevel         Enum      (LOW, MEDIUM, HIGH)
temperament         String[]  (array de traits)
neutered            Boolean   @default(false)
microchipId         String?
allergies           String[]
medicalConditions   String[]
diet                String?
photos              String[]  (URLs)
isActive            Boolean   @default(true)
profileCompletion   Int       @default(0)
createdAt           DateTime
updatedAt           DateTime
```

### pet_vaccines
```
id                  String    @id
petId               String    → pets.id
name                String    (ej: "Rabia", "Parvovirus")
dateAdministered    DateTime
nextDueDate         DateTime?
veterinarian        String?
notes               String?
documentUrl         String?
createdAt           DateTime
```

### pet_documents
```
id                  String    @id
petId               String    → pets.id
type                Enum      (MEDICAL_RECORD, VACCINATION_CARD, PRESCRIPTION, INSURANCE, OTHER)
title               String
fileUrl             String
uploadedAt          DateTime
```

### pet_medications
```
id                  String    @id
petId               String    → pets.id
name                String
dosage              String
frequency           String    (ej: "2 veces al día")
startDate           DateTime
endDate             DateTime?
isActive            Boolean   @default(true)
notes               String?
```

### reminders
```
id                  String    @id
userId              String    → users.id
petId               String    → pets.id
type                Enum      (VACCINE, DEWORMING, MEDICATION, GROOMING, CHECKUP, CUSTOM)
title               String
description         String?
dueDate             DateTime
recurrence          Enum      (NONE, DAILY, WEEKLY, MONTHLY, QUARTERLY, BIANNUAL, ANNUAL)
status              Enum      (PENDING, SENT, COMPLETED, DISMISSED)
notifyBefore        Int       @default(3)  // días antes
createdAt           DateTime
```

### provider_profiles
```
id                  String    @id
userId              String    @unique → users.id
type                Enum      (WALKER, SITTER, GROOMER, BOARDING, VET)
displayName         String
bio                 String
experience          Int       // años
certifications      String[]
photos              String[]  (del espacio/trabajo)
coverageRadius      Int       @default(5)  // km
verificationStatus  Enum      (PENDING, VERIFIED, PARTIAL, REJECTED)
verifiedAt          DateTime?
trustScore          Float     @default(0)
totalServices       Int       @default(0)
averageRating       Float     @default(0)
responseTime        Int?      // minutos promedio
acceptanceRate      Float?    // porcentaje
bankAccountId       String?   // Stripe Connected Account ID
isActive            Boolean   @default(true)
createdAt           DateTime
updatedAt           DateTime
```

### provider_documents
```
id                  String    @id
providerId          String    → provider_profiles.id
type                Enum      (ID_CARD, BACKGROUND_CHECK, CERTIFICATION, SPACE_PHOTO)
fileUrl             String
status              Enum      (PENDING, APPROVED, REJECTED)
reviewedAt          DateTime?
reviewedBy          String?   → users.id
notes               String?
uploadedAt          DateTime
```

### provider_badges
```
id                  String    @id
providerId          String    → provider_profiles.id
type                Enum      (IDENTITY_VERIFIED, BACKGROUND_OK, SUPER_PROVIDER, SPACE_VERIFIED, CERTIFIED)
earnedAt            DateTime
expiresAt           DateTime?
```

### services
```
id                  String    @id
providerId          String    → provider_profiles.id
type                Enum      (WALK, SITTING, DAYCARE, BOARDING, GROOMING, VET_HOME)
title               String
description         String?
price               Float     // precio base
priceUnit           Enum      (PER_HOUR, PER_VISIT, PER_DAY, PER_NIGHT, PER_SESSION)
duration            Int?      // minutos
maxPets             Int       @default(1)
acceptedSizes       String[]  (SMALL, MEDIUM, LARGE, XLARGE)
acceptedSpecies     String[]  (DOG, CAT)
city                String
isActive            Boolean   @default(true)
createdAt           DateTime
updatedAt           DateTime
```

### service_availability
```
id                  String    @id
serviceId           String    → services.id
dayOfWeek           Int       (0=domingo, 6=sábado)
startTime           String    (HH:MM)
endTime             String    (HH:MM)
maxBookings         Int       @default(1)
```

### bookings
```
id                  String    @id
userId              String    → users.id (dueño)
providerId          String    → provider_profiles.id
serviceId           String    → services.id
petId               String    → pets.id
status              Enum      (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
scheduledDate       DateTime
scheduledEndDate    DateTime?
startedAt           DateTime?
completedAt         DateTime?
totalPrice          Float
serviceFee          Float     // fee del dueño (7%)
platformFee         Float     // comisión (15%)
providerEarnings    Float     // lo que recibe el proveedor
notes               String?
cancellationReason  String?
cancelledBy         Enum?     (USER, PROVIDER, SYSTEM)
cancelledAt         DateTime?
createdAt           DateTime
updatedAt           DateTime
```

### booking_events
```
id                  String    @id
bookingId           String    → bookings.id
type                Enum      (CREATED, CONFIRMED, STARTED, PHOTO_SENT, COMPLETED, CANCELLED, DISPUTED)
data                Json?     // metadata adicional
createdAt           DateTime
```

### walk_tracking
```
id                  String    @id
bookingId           String    @unique → bookings.id
coordinates         Json      // [{lat, lng, timestamp}]
totalDistance        Float?    // metros
totalDuration       Int?      // segundos
startLocation       Json?     // {lat, lng}
endLocation         Json?     // {lat, lng}
createdAt           DateTime
updatedAt           DateTime
```

### report_cards
```
id                  String    @id
bookingId           String    @unique → bookings.id
mood                Enum      (HAPPY, NORMAL, ANXIOUS, EXCITED)
activities          String[]  (WALK, PLAY, REST, SOCIALIZED)
didPee              Boolean   @default(false)
didPoop             Boolean   @default(false)
ateFood             Boolean   @default(false)
drankWater          Boolean   @default(false)
photos              String[]  (URLs)
notes               String?
createdAt           DateTime
```

### reviews
```
id                  String    @id
bookingId           String?   → bookings.id
orderId             String?   → orders.id
reviewerId          String    → users.id
revieweeId          String    → users.id (proveedor o seller)
rating              Int       (1-5)
punctualityRating   Int?      (1-5, para servicios)
careRating          Int?      (1-5, para servicios)
communicationRating Int?      (1-5)
text                String?
photos              String[]
response            String?   // respuesta del proveedor
respondedAt         DateTime?
isVerified          Boolean   @default(true) // booking/order verificado
createdAt           DateTime
updatedAt           DateTime
```

### payments
```
id                  String    @id
userId              String    → users.id
bookingId           String?   → bookings.id
orderId             String?   → orders.id
subscriptionId      String?   → subscriptions.id
amount              Float
currency            String    @default("USD")
status              Enum      (PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED, PARTIALLY_REFUNDED)
method              Enum      (CARD, WALLET, TRANSFER)
stripePaymentId     String?
refundAmount        Float?
refundReason        String?
refundedAt          DateTime?
createdAt           DateTime
```

### payouts
```
id                  String    @id
providerId          String    → provider_profiles.id
amount              Float
currency            String
status              Enum      (PENDING, PROCESSING, COMPLETED, FAILED)
stripePayoutId      String?
periodStart         DateTime
periodEnd           DateTime
bookingIds          String[]  // bookings incluidos en este payout
scheduledAt         DateTime
completedAt         DateTime?
failureReason       String?
```

### products
```
id                  String    @id
sellerId            String    → users.id
name                String
description         String
category            Enum      (FOOD_DRY, FOOD_WET, FOOD_NATURAL, PHARMACY, ACCESSORIES, HYGIENE, TOYS, BEDS, CLOTHING, TRAVEL)
brand               String?
photos              String[]
targetSpecies       String[]  (DOG, CAT, BOTH)
targetSize          String[]? (SMALL, MEDIUM, LARGE, XLARGE)
targetBreed         String?
averageRating       Float     @default(0)
totalReviews        Int       @default(0)
isActive            Boolean   @default(true)
isApproved          Boolean   @default(false)
approvedAt          DateTime?
createdAt           DateTime
updatedAt           DateTime
```

### product_variants
```
id                  String    @id
productId           String    → products.id
name                String    (ej: "10kg - Pollo")
sku                 String    @unique
price               Float
compareAtPrice      Float?    // precio antes de descuento
weight              Float?    // kg
stock               Int       @default(0)
isActive            Boolean   @default(true)
```

### carts
```
id                  String    @id
userId              String    @unique → users.id
updatedAt           DateTime
```

### cart_items
```
id                  String    @id
cartId              String    → carts.id
variantId           String    → product_variants.id
quantity            Int       @default(1)
isAutoship          Boolean   @default(false)
autoshipFrequency   Int?      // semanas
addedAt             DateTime
```

### orders
```
id                  String    @id
userId              String    → users.id
sellerId            String    → users.id
orderNumber         String    @unique
status              Enum      (PENDING, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
subtotal            Float
shippingCost        Float
discount            Float     @default(0)
total               Float
platformFee         Float     // comisión 12%
sellerEarnings      Float
shippingAddress     Json      // {street, city, zip, etc.}
trackingNumber      String?
trackingUrl         String?
notes               String?
createdAt           DateTime
updatedAt           DateTime
```

### order_items
```
id                  String    @id
orderId             String    → orders.id
variantId           String    → product_variants.id
productName         String    // snapshot al momento de compra
variantName         String
price               Float     // precio al momento de compra
quantity            Int
subtotal            Float
```

### subscriptions
```
id                  String    @id
userId              String    → users.id
type                Enum      (AUTOSHIP, PREMIUM)
status              Enum      (ACTIVE, PAUSED, CANCELLED, EXPIRED)
plan                String?   (ej: "PREMIUM_MONTHLY", "PREMIUM_ANNUAL")
variantId           String?   → product_variants.id (si autoship)
quantity            Int?      (si autoship)
frequency           Int?      // semanas (si autoship)
nextDeliveryDate    DateTime? (si autoship)
nextBillingDate     DateTime
price               Float
discount            Float     @default(0)
stripeSubscriptionId String?
shippingAddress     Json?
pausedAt            DateTime?
cancelledAt         DateTime?
createdAt           DateTime
updatedAt           DateTime
```

### vet_appointments
```
id                  String    @id
userId              String    → users.id (dueño)
vetId               String    → users.id (veterinario)
petId               String    → pets.id
type                Enum      (GENERAL, URGENCY, SECOND_OPINION, PRESCRIPTION, HOME_VISIT)
mode                Enum      (VIDEO, CHAT, HOME)
status              Enum      (SCHEDULED, WAITING, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
scheduledAt         DateTime?
startedAt           DateTime?
endedAt             DateTime?
duration            Int?      // minutos
symptoms            String?
diagnosis           String?
notes               String?
price               Float
recordingUrl        String?
createdAt           DateTime
```

### vet_prescriptions
```
id                  String    @id
appointmentId       String    → vet_appointments.id
petId               String    → pets.id
vetId               String    → users.id
medication          String
dosage              String
frequency           String
duration            String
instructions        String?
linkedProductId     String?   → products.id
createdAt           DateTime
```

### conversations
```
id                  String    @id
type                Enum      (BOOKING, MATCH, SUPPORT)
bookingId           String?   → bookings.id
createdAt           DateTime
updatedAt           DateTime
```

### conversation_participants
```
id                  String    @id
conversationId      String    → conversations.id
userId              String    → users.id
lastReadAt          DateTime?
joinedAt            DateTime
```

### messages
```
id                  String    @id
conversationId      String    → conversations.id
senderId            String    → users.id
type                Enum      (TEXT, IMAGE, FILE, SYSTEM, LOCATION)
content             String
mediaUrl            String?
status              Enum      (SENT, DELIVERED, READ)
createdAt           DateTime
```

### incidents
```
id                  String    @id
reporterId          String    → users.id
reportedId          String?   → users.id
bookingId           String?   → bookings.id
orderId             String?   → orders.id
category            Enum      (PAYMENT, SERVICE, PRODUCT, PROVIDER, EMERGENCY, OTHER)
severity            Enum      (LOW, MEDIUM, HIGH, CRITICAL)
status              Enum      (OPEN, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED)
description         String
evidence            String[]  (URLs de fotos/screenshots)
resolution          String?
resolvedBy          String?   → users.id
resolvedAt          DateTime?
createdAt           DateTime
updatedAt           DateTime
```

### promotions
```
id                  String    @id
code                String    @unique
type                Enum      (PERCENTAGE, FIXED_AMOUNT)
value               Float     // % o monto
minOrderAmount      Float?
maxDiscount         Float?
applicableTo        Enum      (SERVICES, PRODUCTS, ALL)
category            String?   // categoría específica
usageLimit          Int?
usedCount           Int       @default(0)
perUserLimit        Int       @default(1)
startsAt            DateTime
expiresAt           DateTime
isActive            Boolean   @default(true)
createdAt           DateTime
```

### loyalty_points
```
id                  String    @id
userId              String    → users.id
points              Int       @default(0)
lifetimePoints      Int       @default(0)
level               Enum      (BRONZE, SILVER, GOLD)
lastEarnedAt        DateTime?
```

### loyalty_transactions
```
id                  String    @id
userId              String    → users.id
type                Enum      (EARNED, REDEEMED, EXPIRED, ADJUSTED)
points              Int       // positivo o negativo
reason              String
referenceId         String?   // booking_id, order_id, etc.
createdAt           DateTime
```

### memberships (B2B)
```
id                  String    @id
companyName         String
contactEmail        String
plan                Enum      (BASIC, PREMIUM)
pricePerEmployee    Float
maxEmployees        Int
activeEmployees     Int       @default(0)
benefits            Json      // descuentos, tele-vet incluida, etc.
startsAt            DateTime
expiresAt           DateTime
status              Enum      (ACTIVE, EXPIRED, CANCELLED)
createdAt           DateTime
```

### favorites
```
id                  String    @id
userId              String    → users.id
providerId          String?   → provider_profiles.id
productId           String?   → products.id
createdAt           DateTime
@@unique([userId, providerId])
@@unique([userId, productId])
```

### notifications
```
id                  String    @id
userId              String    → users.id
type                Enum      (BOOKING, PAYMENT, REMINDER, PROMOTION, SYSTEM, CHAT)
title               String
body                String
data                Json?     // deep link info
isRead              Boolean   @default(false)
readAt              DateTime?
createdAt           DateTime
```

## 15.2 Relaciones principales

```
User 1──N Pets
User 1──1 ProviderProfile
User 1──1 Cart
User 1──N Bookings (como dueño)
User 1──N Orders (como comprador)
User 1──N Reviews (como reviewer)
User 1──N Subscriptions
User 1──1 LoyaltyPoints
User 1──N Favorites
User 1──N Notifications

Pet 1──N PetVaccines
Pet 1──N PetDocuments
Pet 1──N PetMedications
Pet 1──N Reminders
Pet 1──N Bookings
Pet 1──N VetAppointments

ProviderProfile 1──N Services
ProviderProfile 1──N ProviderDocuments
ProviderProfile 1──N ProviderBadges
ProviderProfile 1──N Payouts

Service 1──N ServiceAvailability
Service 1──N Bookings

Booking 1──N BookingEvents
Booking 1──1 WalkTracking
Booking 1──1 ReportCard
Booking 1──N Reviews
Booking 1──N Payments

Product 1──N ProductVariants
Product 1──N Reviews

Order 1──N OrderItems
Order 1──N Payments

VetAppointment 1──N VetPrescriptions

Conversation 1──N ConversationParticipants
Conversation 1──N Messages
```

---

# 16. API / LÓGICA BACKEND

## 16.1 Endpoints REST principales

### Auth
```
POST   /api/auth/register          → Registro con email/password
POST   /api/auth/login             → Login
POST   /api/auth/verify-email      → Verificar email
POST   /api/auth/verify-phone      → Verificar teléfono (OTP)
POST   /api/auth/forgot-password   → Solicitar reset
POST   /api/auth/reset-password    → Reset password
GET    /api/auth/session           → Sesión actual
DELETE /api/auth/session           → Logout
```

### Users
```
GET    /api/users/me               → Perfil del usuario actual
PUT    /api/users/me               → Actualizar perfil
DELETE /api/users/me               → Eliminar cuenta (soft delete)
GET    /api/users/me/notifications → Notificaciones
PUT    /api/users/me/notifications/:id/read → Marcar como leída
```

### Pets
```
GET    /api/pets                   → Mis mascotas
POST   /api/pets                   → Crear mascota
GET    /api/pets/:id               → Detalle de mascota
PUT    /api/pets/:id               → Actualizar mascota
DELETE /api/pets/:id               → Eliminar mascota
POST   /api/pets/:id/vaccines      → Agregar vacuna
POST   /api/pets/:id/documents     → Subir documento
POST   /api/pets/:id/medications   → Agregar medicamento
GET    /api/pets/:id/reminders     → Recordatorios de la mascota
POST   /api/pets/:id/reminders     → Crear recordatorio
```

### Services (búsqueda)
```
GET    /api/services/search        → Buscar servicios (filtros, geo, paginación)
GET    /api/services/:id           → Detalle del servicio
GET    /api/providers/:id          → Perfil público del proveedor
GET    /api/providers/:id/reviews  → Reviews del proveedor
GET    /api/providers/:id/availability → Disponibilidad
```

### Services (gestión — proveedor)
```
GET    /api/provider/services      → Mis servicios
POST   /api/provider/services      → Crear servicio
PUT    /api/provider/services/:id  → Actualizar servicio
DELETE /api/provider/services/:id  → Desactivar servicio
PUT    /api/provider/availability  → Actualizar disponibilidad
GET    /api/provider/dashboard     → Métricas del proveedor
GET    /api/provider/earnings      → Ingresos y payouts
```

### Bookings
```
POST   /api/bookings               → Crear booking
GET    /api/bookings                → Mis bookings (dueño)
GET    /api/bookings/:id            → Detalle de booking
PUT    /api/bookings/:id/confirm    → Confirmar (proveedor)
PUT    /api/bookings/:id/start      → Iniciar servicio (check-in)
PUT    /api/bookings/:id/complete   → Completar servicio (check-out)
PUT    /api/bookings/:id/cancel     → Cancelar
POST   /api/bookings/:id/review     → Dejar review
POST   /api/bookings/:id/report-card → Crear report card
POST   /api/bookings/:id/incident   → Reportar incidente
```

### Tracking
```
POST   /api/tracking/:bookingId/start     → Iniciar tracking GPS
POST   /api/tracking/:bookingId/update    → Enviar coordenada (WebSocket preferido)
POST   /api/tracking/:bookingId/end       → Finalizar tracking
GET    /api/tracking/:bookingId/live      → Obtener posición actual
GET    /api/tracking/:bookingId/route     → Obtener ruta completa
```

### Products (V2)
```
GET    /api/products/search         → Buscar productos (filtros, categoría, paginación)
GET    /api/products/:id            → Detalle de producto
GET    /api/products/:id/reviews    → Reviews del producto
POST   /api/products/:id/review     → Dejar review de producto
```

### Cart & Checkout (V2)
```
GET    /api/cart                    → Mi carrito
POST   /api/cart/items              → Agregar al carrito
PUT    /api/cart/items/:id          → Actualizar cantidad
DELETE /api/cart/items/:id          → Eliminar del carrito
POST   /api/cart/checkout           → Procesar compra
POST   /api/cart/apply-coupon       → Aplicar cupón
```

### Orders (V2)
```
GET    /api/orders                  → Mis pedidos
GET    /api/orders/:id              → Detalle de orden
PUT    /api/orders/:id/cancel       → Cancelar orden
```

### Seller (V2)
```
GET    /api/seller/products         → Mis productos
POST   /api/seller/products         → Crear producto
PUT    /api/seller/products/:id     → Actualizar producto
GET    /api/seller/orders           → Órdenes recibidas
PUT    /api/seller/orders/:id/ship  → Marcar como enviado
GET    /api/seller/dashboard        → Métricas del seller
```

### Tele-vet (V2)
```
POST   /api/vet/appointments        → Solicitar consulta
GET    /api/vet/appointments         → Mis consultas (dueño o vet)
GET    /api/vet/appointments/:id     → Detalle de consulta
PUT    /api/vet/appointments/:id/start → Iniciar consulta
PUT    /api/vet/appointments/:id/end   → Finalizar consulta
POST   /api/vet/appointments/:id/prescription → Crear prescripción
GET    /api/vet/availability         → Disponibilidad del vet
PUT    /api/vet/availability         → Configurar disponibilidad
```

### Subscriptions (V2)
```
GET    /api/subscriptions           → Mis suscripciones
POST   /api/subscriptions           → Crear suscripción (autoship o premium)
PUT    /api/subscriptions/:id       → Modificar (frecuencia, pausar)
DELETE /api/subscriptions/:id       → Cancelar suscripción
```

### Chat
```
GET    /api/conversations           → Mis conversaciones
GET    /api/conversations/:id       → Mensajes de conversación
POST   /api/conversations/:id/messages → Enviar mensaje
PUT    /api/conversations/:id/read  → Marcar como leída
```

### Favorites
```
GET    /api/favorites               → Mis favoritos
POST   /api/favorites               → Agregar favorito
DELETE /api/favorites/:id           → Eliminar favorito
```

### Admin
```
GET    /api/admin/dashboard         → Métricas globales
GET    /api/admin/users             → Listado de usuarios (filtros, paginación)
PUT    /api/admin/users/:id/ban     → Ban/unban usuario
GET    /api/admin/providers         → Proveedores pendientes de verificación
PUT    /api/admin/providers/:id/verify → Aprobar/rechazar proveedor
GET    /api/admin/incidents         → Incidentes abiertos
PUT    /api/admin/incidents/:id     → Resolver incidente
GET    /api/admin/reviews/reported  → Reviews reportadas
PUT    /api/admin/reviews/:id       → Moderar review
GET    /api/admin/analytics         → Analytics detallados
PUT    /api/admin/config            → Configuración de plataforma
```

## 16.2 Auth flows

```
REGISTRO:
1. POST /register → validar datos (Zod) → hash password → crear user → enviar email verificación
2. Click link → POST /verify-email → marcar emailVerified
3. Redirect a onboarding

LOGIN:
1. POST /login → buscar user → comparar password → generar JWT
2. JWT incluye: userId, role, name, email
3. Middleware valida JWT en cada request protegida

GOOGLE OAUTH:
1. Redirect a Google → callback → NextAuth crea/actualiza user → JWT
```

## 16.3 Booking engine

```
CREAR BOOKING:
1. Validar: usuario autenticado, servicio existe, servicio activo
2. Validar: mascota pertenece al usuario
3. Validar: fecha/hora dentro de disponibilidad del proveedor
4. Validar: no excede capacidad del slot
5. Calcular precio: servicio.price × duración + serviceFee (7%)
6. Calcular split: platformFee (15%), providerEarnings
7. Crear Payment intent en Stripe (hold)
8. Crear Booking (status: PENDING)
9. Crear BookingEvent (CREATED)
10. Notificar al proveedor (push + in-app)

CONFIRMAR (PROVEEDOR):
1. Validar: booking.status === PENDING
2. Validar: proveedor es el dueño del servicio
3. Capturar payment en Stripe
4. Actualizar status → CONFIRMED
5. Crear BookingEvent (CONFIRMED)
6. Notificar al dueño

INICIAR (CHECK-IN):
1. Validar: booking.status === CONFIRMED
2. Validar: geolocalización dentro de 200m de la dirección
3. Foto obligatoria de la mascota
4. Actualizar status → IN_PROGRESS, startedAt = now()
5. Crear BookingEvent (STARTED)
6. Iniciar tracking GPS
7. Notificar al dueño: "[Mascota] está con [Proveedor]"

COMPLETAR (CHECK-OUT):
1. Validar: booking.status === IN_PROGRESS
2. Validar: report card creada
3. Finalizar tracking GPS
4. Actualizar status → COMPLETED, completedAt = now()
5. Crear BookingEvent (COMPLETED)
6. Programar payout al proveedor (48h delay)
7. Notificar al dueño + prompt de review
```

## 16.4 Pricing engine

```
calcularPrecioBooking(service, duracion, fecha):
  precioBase = service.price

  // Ajuste por duración
  if service.priceUnit === PER_HOUR:
    precioServicio = precioBase × (duracion / 60)
  else:
    precioServicio = precioBase

  // Surge pricing (V2)
  if esTemporadaAlta(fecha):
    precioServicio *= 1.20 // +20%

  // Fees
  serviceFee = precioServicio × 0.07  // 7% al dueño
  platformFee = precioServicio × 0.15 // 15% comisión
  providerEarnings = precioServicio - platformFee

  return {
    subtotal: precioServicio,
    serviceFee,
    total: precioServicio + serviceFee,
    platformFee,
    providerEarnings
  }
```

## 16.5 Cancellation engine

```
procesarCancelacion(booking, cancelledBy):
  horasAntes = diferencia(booking.scheduledDate, ahora) en horas

  if cancelledBy === PROVIDER:
    reembolso = booking.totalPrice  // 100% siempre
    penalizacion = true  // afecta ranking

  if cancelledBy === USER:
    if horasAntes > 48:
      reembolso = booking.totalPrice  // 100%
    elif horasAntes > 24:
      reembolso = booking.totalPrice × 0.50  // 50%
      providerCompensation = booking.providerEarnings × 0.50
    else:
      reembolso = 0
      providerCompensation = booking.providerEarnings

  if booking.status === IN_PROGRESS:
    reembolso = 0  // servicio ya iniciado

  // Ejecutar
  if reembolso > 0:
    crearRefundEnStripe(booking.paymentId, reembolso)

  booking.status = CANCELLED
  booking.cancelledBy = cancelledBy
  booking.cancelledAt = ahora
  booking.cancellationReason = razon

  notificar(otraParte, "Booking cancelado")
  crearBookingEvent(CANCELLED)
```

## 16.6 Payout logic

```
// Ejecutar cada lunes a las 6am (cron job)
procesarPayoutsSemanales():
  proveedores = obtenerProveedoresConBalancePendiente()

  for proveedor in proveedores:
    bookingsCompletados = obtenerBookings(
      providerId: proveedor.id,
      status: COMPLETED,
      completedAt: < hace48h,  // ventana de disputa
      payoutStatus: PENDING
    )

    if bookingsCompletados.length === 0: continue

    totalEarnings = sum(bookingsCompletados.map(b => b.providerEarnings))

    if totalEarnings < 20: continue  // mínimo USD 20

    payout = crearPayoutEnStripe(
      connectedAccountId: proveedor.bankAccountId,
      amount: totalEarnings
    )

    guardarPayout({
      providerId: proveedor.id,
      amount: totalEarnings,
      bookingIds: bookingsCompletados.map(b => b.id),
      stripePayoutId: payout.id,
      status: PROCESSING
    })

    notificar(proveedor, "Payout de USD ${totalEarnings} en camino")
```

## 16.7 Reminder scheduler

```
// Ejecutar cada hora (cron job)
procesarRecordatorios():
  recordatoriosPendientes = obtenerReminders(
    status: PENDING,
    dueDate: <= ahora + notifyBefore días
  )

  for reminder in recordatoriosPendientes:
    diasParaVencer = diferencia(reminder.dueDate, ahora) en días

    // Enviar según configuración
    if diasParaVencer === reminder.notifyBefore
       OR diasParaVencer === 1
       OR diasParaVencer === 0:

      enviarPush(reminder.userId, {
        title: "Recordatorio para ${pet.name}",
        body: reminder.title,
        data: { petId: reminder.petId, type: reminder.type }
      })

      crearNotificacion(reminder.userId, reminder)
      reminder.status = SENT

    // Recurrencia
    if reminder.dueDate < ahora AND reminder.recurrence !== NONE:
      proximaFecha = calcularProximaFecha(reminder.dueDate, reminder.recurrence)
      crearNuevoReminder({
        ...reminder,
        dueDate: proximaFecha,
        status: PENDING
      })
      reminder.status = COMPLETED
```

## 16.8 Recommendation engine (simple)

```
recomendarProductos(userId):
  mascotas = obtenerMascotas(userId)
  historial = obtenerCompras(userId, ultimos6Meses)

  recomendaciones = []

  for mascota in mascotas:
    // Por raza y tamaño
    productosParaRaza = buscarProductos({
      targetSpecies: mascota.species,
      targetSize: mascota.size,
      targetBreed: mascota.breed,
      orderBy: averageRating DESC,
      limit: 5
    })
    recomendaciones.push(...productosParaRaza)

    // Recompra de lo que ya compró
    for compra in historial:
      if compra.suscripcion === null:
        recomendaciones.push({
          ...compra.producto,
          reason: "Compraste esto hace ${diasDesdeCompra} días",
          suggestAutoship: true
        })

    // Por peso (comida)
    if mascota.weight:
      comidaAdecuada = buscarAlimento({
        species: mascota.species,
        pesoMascota: mascota.weight,
        orderBy: popularidad DESC,
        limit: 3
      })
      recomendaciones.push(...comidaAdecuada)

  return deduplicar(recomendaciones).slice(0, 20)
```

## 16.9 Fraud rules básicas

```
REGLAS DE DETECCIÓN:

1. MULTIPLE_ACCOUNTS:
   - Misma IP + mismo device fingerprint + diferentes emails
   - Acción: bloquear registro, alertar Trust & Safety

2. FAKE_REVIEWS:
   - >3 reviews en 24h desde misma IP
   - Review de usuario registrado hace <24h
   - Texto idéntico o >90% similar a otra review
   - Acción: marcar para revisión manual, ocultar temporalmente

3. CONTACT_SHARING:
   - Regex en chat para detectar: teléfonos, emails, @handles
   - En primeros 3 mensajes de una conversación
   - Acción: warning al usuario, bloquear mensaje

4. FAKE_TRACKING:
   - Coordenadas estáticas por >15 min durante "paseo"
   - Coordenadas fuera del área de servicio
   - Velocidad >40 km/h (en vehículo, no paseando)
   - Acción: alertar al dueño, flag para revisión

5. PAYMENT_FRAUD:
   - Stripe Radar (reglas automáticas)
   - >3 chargebacks en 30 días → ban automático
   - Tarjetas de países distintos al del usuario → verificación extra

6. PROVIDER_ABUSE:
   - Cancelaciones >20% en últimos 30 días → warning
   - Rating <3.0 por 3+ meses → suspensión
   - 2+ incidentes graves → ban inmediato
```

---

# 17. LANZAMIENTO — PLAN GO-TO-MARKET PARA LATAM

## 17.1 Ciudad piloto ideal

**Recomendación: Santiago de Chile**

| Criterio | Santiago | CDMX | Bogotá |
|----------|---------|------|--------|
| Tamaño mercado pet | USD 1.2B (Chile) | USD 4B (México) | USD 1.5B (Colombia) |
| Penetración digital | Alta (75% smartphone) | Alta | Media-alta |
| Densidad urbana | Alta (concentrada) | Muy alta (dispersa) | Alta |
| Competencia directa | Baja (PetHero básico) | Media (varias apps) | Baja |
| Pasarela de pagos | Stripe funciona | Stripe + OXXO | Stripe limitado |
| Poder adquisitivo | Alto para LATAM | Medio | Medio |
| Tamaño manejable para MVP | ✅ 7M hab. | ❌ 22M hab. | ✅ 8M hab. |
| El proyecto ya usa CLP | ✅ | ❌ | ❌ |

**Decisión:** Santiago. Mercado concentrado, alto poder adquisitivo, baja competencia directa, el proyecto ya está configurado para Chile (CLP, .cl, datos de ejemplo chilenos). Permite validar rápido con equipo pequeño.

**Alternativa viable:** Bogotá si se busca mercado más grande con poca competencia.

## 17.2 Categoría inicial

**Paseos de perros** como puerta de entrada.

Justificación:
- Alta frecuencia (semanal o diario)
- Dolor claro y universal ("¿quién pasea a mi perro cuando trabajo?")
- Supply accesible (paseadores ya existen en informal)
- Bajo costo de prueba para el usuario (USD 10-15)
- Genera confianza rápido si funciona bien (tracking + report card)
- Permite expandir a sitting, daycare, boarding una vez que hay confianza

## 17.3 Oferta inicial para usuarios

**"Tu primer paseo a $1.000 CLP (USD 1)"**

- Primer paseo subsidiado (el proveedor recibe pago completo, la plataforma absorbe la diferencia)
- Máximo 1 por usuario
- Requiere crear perfil de mascota completo
- Objetivo: romper la barrera de la primera transacción
- Budget: USD 500 para primeros 50 usuarios (USD 10 subsidio por paseo)

**Pack de lanzamiento:**
- 5 paseos por el precio de 4 (20% descuento)
- Referido: "Invita a un amigo → ambos reciben 1 paseo gratis"

## 17.4 Estrategia para captar proveedores (supply)

**Meta pre-lanzamiento: 50 paseadores verificados.**

| Semana | Acción | Meta |
|--------|--------|------|
| S1-S2 | Outbound: contactar paseadores en Instagram/Facebook que ya ofrecen servicios en Santiago | 30 contactados, 15 interesados |
| S2-S3 | Presencial: visitar parques populares de Santiago (Parque Bicentenario, Araucano, Forestal), hablar con paseadores | 20 contactados |
| S3-S4 | Onboarding: registrar, verificar y capacitar primeros paseadores | 30 verificados |
| S4 | Soft launch: primeros bookings reales con equipo + amigos | 10 bookings |
| S5+ | Referidos de paseadores: "Invita a un colega → bono de $20.000 CLP" | +20 paseadores |

**Incentivo de lanzamiento para proveedores:**
- 0% comisión los primeros 60 días
- Badge "Fundador" permanente
- Prioridad en búsquedas durante los primeros 3 meses

## 17.5 Partnerships

| Partner | Qué ofrecen | Qué reciben |
|---------|------------|-------------|
| Veterinarias locales (3-5) | Validación profesional, referidos de pacientes, posteriormenete tele-vet | Canal de captación de clientes, perfil en directorio |
| Pet shops independientes (5-10) | Distribución de flyers, QR en tienda | Futuro canal de venta (V2 marketplace) |
| Condominios/edificios | Acceso a comunidad de dueños, cartelera | Beneficio para residentes |
| Instagram influencers pet (3-5) | Posts/stories mostrando la app | Membresía premium gratis, canje de servicios |
| Municipalidades | Base de datos de mascotas registradas | Servicio de identificación digital |

## 17.6 Estrategia de referral

```
USUARIO REFIERE USUARIO:
- Referidor: 1 paseo gratis (hasta $15.000 CLP)
- Referido: 50% descuento en primer paseo
- Límite: 10 referidos por usuario
- Requisito: referido debe completar al menos 1 booking

PROVEEDOR REFIERE PROVEEDOR:
- Referidor: $20.000 CLP cuando el referido completa 5 servicios
- Referido: 0% comisión los primeros 30 días
- Sin límite
```

## 17.7 Activaciones

| Activación | Dónde | Cuándo | Objetivo |
|------------|-------|--------|----------|
| Stand en parques | Parque Bicentenario, Araucano | Sábados durante 4 semanas | 200 descargas, 50 registros |
| Evento de lanzamiento | Dog-friendly café | Semana de lanzamiento | PR, fotos, 30 registros |
| Alianza con carrera canina | Eventos running/dog | Calendario local | 100 registros |
| Sampling con marcas pet | Veterinarias partner | Mes 1-2 | Co-marketing, registros |

## 17.8 Contenido

| Canal | Frecuencia | Tipo de contenido |
|-------|-----------|-------------------|
| Instagram | 5 posts/semana | Tips de cuidado, fotos de mascotas, stories de paseadores, testimonios |
| TikTok | 3 videos/semana | Contenido viral: paseos con tracking, report cards, reacciones de dueños |
| Blog (SEO) | 2 artículos/semana | "Mejores parques en Santiago", "Cuánto ejercicio necesita un Labrador", etc. |
| Email | 1/semana | Newsletter con tips + promos |
| WhatsApp | Según trigger | Confirmaciones, recordatorios, ofertas |

## 17.9 CRM y retención

```
TRIGGERS DE RETENCIÓN:

Día 0: Welcome email + push "Completa el perfil de tu mascota"
Día 1: Push "Encuentra un paseador cerca de ti"
Día 3: Si no ha reservado → push con promo primer paseo
Día 7: Si reservó → push "¿Cómo estuvo? Reserva tu próximo paseo"
       Si no reservó → email con testimonios y social proof
Día 14: Push "Tu mascota necesita ejercicio → 20% off en paseo"
Día 30: Si inactivo → "Te extrañamos" + cupón especial
Día 60: Si inactivo → email de re-engagement con cambios/mejoras de la app
Día 90: Si inactivo → última oportunidad + encuesta "¿por qué dejaste de usar?"

TRIGGERS RECURRENTES:
- 7 días sin booking → sugerir paseador favorito
- Vacuna próxima a vencer → recordatorio + "¿necesitas vet?"
- Cumpleaños de mascota → felicitación + descuento especial
- 10 servicios completados → badge + beneficio loyalty
```

---

# 18. DIFERENCIACIÓN

## 18.1 Por qué esta app no debe ser "solo un Rover local"

Rover resuelve UN problema (encontrar cuidadores). PetMatch resuelve el ECOSISTEMA completo de la mascota. La diferencia es equivalente a la de un directorio telefónico vs una super-app:

1. **Rover no vende comida.** Nosotros sí (V2). El dueño que reserva un paseo también necesita comprar comida cada mes. Cross-sell natural.
2. **Rover no gestiona salud.** Nosotros sí. Recordatorios de vacunas, ficha médica, tele-vet. Esto crea datos únicos y switching cost.
3. **Rover no tiene autoship.** La recompra automática genera MRR y retención que un marketplace puro de servicios nunca logra.
4. **Rover no existe en LATAM.** No hay un estándar de confianza para servicios pet. Somos los primeros en establecerlo con verificación + tracking + report cards.
5. **Los datos cruzados son el moat.** Saber que Luna es un Labrador de 30kg, come Royal Canin, tiene vacuna vencida, y su dueño reserva paseos 3 veces por semana permite personalización que nadie más puede ofrecer.

## 18.2 Cómo mezclar e-commerce + servicios + salud sin perder foco

**Principio: la mascota es el centro, no la categoría.**

```
❌ Enfoque incorrecto:
"Somos un marketplace de servicios Y un e-commerce Y una app de salud"
→ Confuso, parece 3 apps en una.

✅ Enfoque correcto:
"Todo gira alrededor de tu mascota"
→ Desde el perfil de Luna, accedo a:
   - "Buscar paseador para Luna" (servicio)
   - "Comida recomendada para Luna" (producto)
   - "Vacunas de Luna" (salud)
   - "Consultar al vet sobre Luna" (tele-vet)
```

**Ejecución UX:**
1. **Onboarding centrado en la mascota** (no en la funcionalidad).
2. **Home personalizado** por mascota, no por categoría.
3. **Tabs separados** para servicios y tienda (evitar mezclar).
4. **Salud integrada** en el perfil de mascota (no en un tab separado que se sienta como otra app).
5. **Lanzar por fases**: servicios primero (MVP), luego salud, luego e-commerce. No todo a la vez.

## 18.3 Ventaja competitiva real

```
MOAT 1: Datos del dueño + mascota + salud + consumo + servicios
→ Nadie más tiene esta combinación de datos.
→ Permite recomendaciones, alertas y personalización imposibles para competidores verticales.

MOAT 2: Confianza verificada
→ Verificación de identidad + antecedentes + reviews + tracking + report cards
→ Estándar de confianza que ningún grupo de WhatsApp o Instagram puede ofrecer.

MOAT 3: Recurrencia multi-capa
→ Paseos (semanal) + comida (mensual) + salud (trimestral) + vet (según necesidad)
→ Múltiples razones para volver, no solo una.

MOAT 4: Efecto de red local
→ Más proveedores en mi zona → mejor servicio → más usuarios → más proveedores
→ Winner-takes-most por ciudad.

MOAT 5: Switching cost
→ Historial médico, perfil completo, paseador favorito, suscripciones activas, loyalty points
→ Cuanto más usas, más costoso es irse.
```

## 18.4 Estrategia para convertirse en el "sistema operativo de la mascota"

```
FASE 1 (MVP): Resolver un dolor → "¿Quién cuida a mi mascota?"
  Ser la app de referencia para paseos y cuidado con confianza.

FASE 2 (V2): Resolver más dolores → "Todo lo que mi mascota necesita"
  Agregar compras, salud y tele-vet. El usuario deja de necesitar otras apps.

FASE 3 (V3): Ser indispensable → "No puedo imaginar la vida de mi mascota sin PetMatch"
  Entrenamiento, GPS, comunidad, seguros, beneficios. Ecosistema completo.

FASE 4: Ser infraestructura → "El sistema operativo de la industria pet"
  APIs para clínicas, pet shops, aseguradoras, marcas. PetMatch como plataforma.
  El perfil de la mascota en PetMatch es su "identidad digital" aceptada por terceros.

INDICADORES DE QUE LO LOGRAMOS:
- El dueño dice "déjame ver en PetMatch" ante cualquier necesidad pet.
- Las clínicas piden acceso a la ficha PetMatch de sus pacientes.
- Las marcas quieren distribuir a través de PetMatch.
- Las aseguradoras usan datos PetMatch para underwriting.
```

---

# 19. ENTREGA FINAL

## 19.1 Nombre tentativo

**PetMatch** (mantener el nombre actual)

Funciona porque:
- Comunica conexión ("match") entre dueño y servicios/productos/comunidad
- Es memorable, corto y funciona en español e inglés
- Dominio .cl disponible o adquirible
- Ya tiene identidad construida en el proyecto actual

## 19.2 Tagline

> **"Todo lo que tu mascota necesita. En un solo lugar."**

Alternativas:
- "El sistema operativo de tu mascota"
- "Cuida, alimenta y conecta"
- "Tu mascota merece lo mejor. Nosotros lo hacemos fácil."

## 19.3 Propuesta de brand personality

| Atributo | Cómo se manifiesta |
|----------|-------------------|
| **Confiable** | Verificaciones visibles, tracking transparente, garantía clara |
| **Cálido** | Tono de voz amigable, fotos reales de mascotas, celebraciones (cumpleaños pet) |
| **Moderno** | UI limpia, animaciones suaves, tech-forward (GPS, video, AI) |
| **Inclusivo** | Todas las razas, todos los tamaños, todas las mascotas |
| **Responsable** | Protocolos de seguridad, bienestar animal como prioridad, datos protegidos |

**Tono de voz:** cercano pero profesional. Tuteo (no usted). Emojis moderados (🐾 sí, 🤣 no). Humor sutil. Siempre centrado en la mascota.

**Paleta sugerida:**
- Primario: Verde azulado (#0D9488) — confianza, naturaleza
- Secundario: Naranja cálido (#F97316) — energía, acción
- Neutro: Gris oscuro (#1F2937) + blanco
- Acentos: Amarillo (#FBBF24) para badges y loyalty

## 19.4 Resumen del MVP elegido

**MVP = Marketplace de servicios pet con confianza verificada**

| Componente | Estado |
|-----------|--------|
| Auth (email + Google + verificación) | Mejorar (agregar phone OTP) |
| Perfil de mascota ampliado (salud, comportamiento) | Ampliar modelo existente |
| Búsqueda de servicios por mapa + filtros | Construir sobre base existente |
| Perfiles de proveedores verificados | Nuevo (verificación + badges) |
| Booking mejorado (calendario, pricing, split) | Mejorar modelo existente |
| Tracking GPS en vivo | Nuevo |
| Check-in / Check-out con geoloc | Nuevo |
| Report cards post-servicio | Nuevo |
| Chat mejorado (fotos, archivos) | Mejorar existente |
| Reviews con sub-ratings y badges | Mejorar existente |
| Recordatorios básicos (vacunas, desparasitación) | Nuevo |
| Pagos con Stripe Connect (split + payouts) | Mejorar existente |
| Políticas de cancelación y reembolso | Nuevo |
| Admin panel mejorado | Mejorar existente |
| Landing page optimizada | Mejorar existente |

**Tiempo estimado:** 8-10 semanas de desarrollo con equipo de 2-3 devs.

## 19.5 Resumen del stack

| Capa | Tecnología |
|------|-----------|
| Frontend Web | Next.js 16 + React 19 + Tailwind 4 + shadcn/ui |
| Frontend Mobile | React Native (Expo) — V2 |
| Backend | Next.js Server Actions + API Routes |
| Base de datos | PostgreSQL (Neon) + Prisma 7 |
| Auth | NextAuth 5 (JWT) |
| Pagos | Stripe Connect |
| Real-time | Socket.io |
| Mapas | Google Maps API |
| Storage | Cloudinary |
| Hosting | Vercel + Railway |

## 19.6 Resumen del modelo de negocio

| Revenue stream | Take rate | Fase |
|---------------|-----------|------|
| Comisión por servicio | 15% (proveedor) + 7% (dueño) = 22% | MVP |
| Comisión por producto | 12% (seller) | V2 |
| Membresía Premium | USD 9.99/mes | V2 |
| Fee tele-vet | 20% por consulta | V2 |
| Autoship | Margen del descuento | V2 |
| Anuncios/placement | CPM/CPC | V3 |
| B2B employee benefits | USD 3-5/empleado/mes | V3 |

## 19.7 Próximos 10 pasos concretos para iniciar mañana

| # | Paso | Responsable | Duración |
|---|------|------------|----------|
| 1 | **Migrar a PostgreSQL** (ya soportado). Crear base de datos en Neon. Correr migraciones. | CTO | 1 día |
| 2 | **Ampliar schema de Prisma** con las nuevas tablas (provider_profiles, provider_documents, provider_badges, walk_tracking, report_cards, reminders, pet_vaccines, pet_documents, payouts, booking_events, incidents). | CTO | 2-3 días |
| 3 | **Implementar Stripe Connect** para split de pagos y payouts a proveedores. | CTO | 3-4 días |
| 4 | **Diseñar wireframes** de los 10 flujos core del MVP (Figma). | UX Lead | 5 días (paralelo) |
| 5 | **Implementar onboarding de proveedor** con verificación de documentos. | Dev | 3-4 días |
| 6 | **Implementar búsqueda por mapa** con Google Maps + filtros + geolocalización. | Dev | 3-4 días |
| 7 | **Implementar tracking GPS** de paseos (Socket.io server + mapa en vivo). | Dev | 4-5 días |
| 8 | **Implementar report cards y check-in/check-out**. | Dev | 2-3 días |
| 9 | **Implementar recordatorios** de vacunas y salud básica. | Dev | 2-3 días |
| 10 | **Reclutar primeros 30 paseadores** en Santiago con outbound en redes sociales. | Growth / Founder | 2-3 semanas (paralelo) |

**Total estimado para MVP funcional: 8-10 semanas** con 2 devs + 1 designer + 1 growth.

---

*Documento generado como blueprint de ejecución para PetMatch.*
*Todas las decisiones son revisables y deben validarse con datos reales del mercado.*
*Supuesto principal: equipo de 3-5 personas, pre-funding, Santiago de Chile como piloto.*
