create table clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(120) NOT NULL,
    telefono_cliente VARCHAR(9) NOT NULL,
    email_cliente VARCHAR(120) NOT NULL,
    activo_cliente TINYINT DEFAULT 1
);

create table estados_cita (
    id_estado_cita INT AUTO_INCREMENT PRIMARY KEY,
    str_estado_cita VARCHAR(30) NOT NULL
);

create table citas (
    id_cita INT PRIMARY KEY AUTO_INCREMENT,
    fecha_cita DATETIME NOT NULL,
    cliente_cita INT NOT NULL,
    id_estado_cita INT NOT NULL,
    CONSTRAINT fk_cita_cliente FOREIGN KEY (cliente_cita) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_cita_estado FOREIGN KEY (id_estado_cita) REFERENCES estados_cita(id_estado_cita)
);