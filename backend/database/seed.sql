INSERT INTO clientes (rut, nombre, email, telefono) VALUES
    ('12345678-5', 'Distribuidora Andes Limitada', 'contacto@distribuidoraandes.cl', '+56223456789'),
    ('9876543-3', 'Comercial Puerto Norte SpA', 'operaciones@puertonorte.cl', '+56222345678'),
    ('15678234-3', 'Camila Rojas Fuentes', 'camila.rojas@correo.cl', '+56987654321'),
    ('7654321-6', 'Ferreteria El Maiten', 'ventas@elmaiten.cl', '+56412345678'),
    ('18234567-9', 'Sebastian Muller Vega', 'sebastian.muller@correo.cl', '+56976543210'),
    ('20111222-2', 'Importadora Bahia Azul SpA', 'despachos@bahiaazul.cl', '+56322456789'),
    ('16543210-K', 'Patricia Lagos Herrera', 'patricia.lagos@correo.cl', '+56965432187'),
    ('13579246-2', 'Logistica Valle Central Limitada', 'soporte@vallecentral.cl', '+56712345678')
ON CONFLICT (rut) DO NOTHING;

INSERT INTO solicitudes (numero, cliente_id, fecha, tipo_solicitud, estado, descripcion)
SELECT
    origen.numero,
    cliente.id,
    origen.fecha,
    origen.tipo_solicitud,
    origen.estado,
    origen.descripcion
FROM (VALUES
    ('SOL-2026-0001', '12345678-5', DATE '2026-06-08', 'Pedido nuevo', 'Finalizada', 'Despacho de 40 cajas de insumos a bodega central de Quilicura, entregado conforme.'),
    ('SOL-2026-0002', '9876543-3', DATE '2026-06-15', 'Retraso o extravio', 'Finalizada', 'Carga con dos dias de atraso en ruta Valparaiso a Santiago, reubicada y entregada.'),
    ('SOL-2026-0003', '15678234-3', DATE '2026-06-22', 'Cambio de direccion', 'Finalizada', 'Cliente solicita redirigir el envio a su nuevo domicilio en Nunoa antes del reparto.'),
    ('SOL-2026-0004', '7654321-6', DATE '2026-06-29', 'Devolucion', 'Rechazada', 'Devolucion de perfiles metalicos fuera del plazo de 30 dias establecido en contrato.'),
    ('SOL-2026-0005', '18234567-9', DATE '2026-07-03', 'Cancelacion', 'Finalizada', 'Cancelacion del pedido antes de la preparacion, sin costo asociado para el cliente.'),
    ('SOL-2026-0006', '20111222-2', DATE '2026-07-07', 'Pedido nuevo', 'En proceso', 'Retiro de contenedor en puerto de San Antonio con traslado a centro de distribucion.'),
    ('SOL-2026-0007', '13579246-2', DATE '2026-07-10', 'Reprogramacion', 'En proceso', 'Reprogramar entrega al 2026-07-18 por cierre temporal de la bodega de destino.'),
    ('SOL-2026-0008', '16543210-K', DATE '2026-07-13', 'Consulta de estado', 'Finalizada', 'Consulta por ubicacion del despacho, informado en transito con entrega estimada.'),
    ('SOL-2026-0009', '12345678-5', DATE '2026-07-16', 'Retraso o extravio', 'En proceso', 'Bulto no registrado en el ultimo escaneo, en investigacion con el operador de ruta.'),
    ('SOL-2026-0010', '9876543-3', DATE '2026-07-20', 'Devolucion', 'Pendiente', 'Devolucion de mercaderia recibida con embalaje danado, pendiente de retiro en origen.'),
    ('SOL-2026-0011', '15678234-3', DATE '2026-07-22', 'Cambio de direccion', 'Pendiente', 'Actualizar direccion de entrega a oficina comercial en Providencia para el proximo envio.'),
    ('SOL-2026-0012', '7654321-6', DATE '2026-07-24', 'Pedido nuevo', 'Pendiente', 'Solicitud de despacho de 12 pallets de herramientas a sucursal de Concepcion.'),
    ('SOL-2026-0013', '18234567-9', DATE '2026-07-27', 'Reprogramacion', 'Pendiente', 'Cliente pide adelantar la entrega al primer bloque horario de la manana.'),
    ('SOL-2026-0014', '20111222-2', DATE '2026-07-28', 'Cancelacion', 'Rechazada', 'Cancelacion solicitada con la carga ya en ruta, no es posible detener el despacho.')
) AS origen (numero, rut, fecha, tipo_solicitud, estado, descripcion)
JOIN clientes cliente ON cliente.rut = origen.rut
ON CONFLICT (numero) DO NOTHING;
