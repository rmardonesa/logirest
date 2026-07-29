CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    cliente_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo_solicitud VARCHAR(30) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    descripcion TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_solicitudes_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE RESTRICT,
    CONSTRAINT chk_solicitudes_tipo_solicitud CHECK (
        tipo_solicitud IN (
            'Pedido nuevo',
            'Cambio de direccion',
            'Retraso o extravio',
            'Cancelacion',
            'Devolucion',
            'Reprogramacion',
            'Consulta de estado'
        )
    ),
    CONSTRAINT chk_solicitudes_estado CHECK (
        estado IN ('Pendiente', 'En proceso', 'Finalizada', 'Rechazada')
    )
);

CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes (nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes (email);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes (estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes (fecha);
CREATE INDEX IF NOT EXISTS idx_solicitudes_cliente_id ON solicitudes (cliente_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_solicitudes_updated_at ON solicitudes;

CREATE TRIGGER trg_solicitudes_updated_at
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
