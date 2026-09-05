from sqlalchemy import Column, Integer, String, Text, Boolean, Float, ForeignKey
from config_db import Base


class TuInformacion(Base):
    __tablename__ = "tuinformacion"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("users.cedula"),
        nullable=False,
        index=True
    )

    nombre_completo = Column(
        String(200),
        nullable=True
    )

    foto = Column(
            String(200),
            nullable=True
        )

    dedicacion = Column(
        String(150),
        nullable=True
    )

    dedicacion_detallada = Column(
        String(250),
        nullable=True
    )

    direccion = Column(
        String(200),
        nullable=True
    )

    disponibilidad = Column(
        Boolean,
        nullable=True
    )

    sobre_mi = Column(
        Text,
        nullable=True
    )

    numero_telefono = Column(
        String(20),
        nullable=True
    )

    correo = Column(
        String(150),
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=False
    )


class QueHago(Base):
    __tablename__ = "quehago"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tu_informacion = Column(
        Integer,
        ForeignKey("tuinformacion.id"),
        nullable=False,
        index=True
    )

    titulo = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=False
    )

    icon = Column(
        String(100),
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


class MisEspecialidades(Base):
    __tablename__ = "misespecialidades"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tu_informacion = Column(
        Integer,
        ForeignKey("tuinformacion.id"),
        nullable=False,
        index=True
    )

    icon = Column(
        String(100),
        nullable=False
    )

    descripcion = Column(
        String(200),
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


class ComoFunciona(Base):
    __tablename__ = "comofunciona"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tu_informacion = Column(
        Integer,
        ForeignKey("tuinformacion.id"),
        nullable=False,
        index=True
    )

    titulo = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


class InformacionServicio(Base):
    __tablename__ = "informacionservicio"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tu_informacion = Column(
        Integer,
        ForeignKey("tuinformacion.id"),
        nullable=False,
        index=True
    )

    titulo = Column(
        String(150),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


class MiExperiencia(Base):
    __tablename__ = "miexperiencia"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tu_informacion = Column(
        Integer,
        ForeignKey("tuinformacion.id"),
        nullable=False,
        index=True
    )

    anos_experiencia = Column(
        Integer,
        nullable=True
    )

    clientes_atendidos = Column(
        Integer,
        nullable=True
    )

    calificacion_promedio = Column(
        Float,
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


class PorqueTrabajarConmigo(Base):
    __tablename__ = "porquetrabajarconmigo"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    id_tu_informacion = Column(
        Integer,
        ForeignKey("tuinformacion.id"),
        nullable=False,
        index=True
    )

    descripcion = Column(
        Text,
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )
