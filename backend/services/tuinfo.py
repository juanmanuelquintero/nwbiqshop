from models.tuinfo import (
    TuInformacion,
    QueHago,
    MisEspecialidades,
    ComoFunciona,
    InformacionServicio,
    MiExperiencia,
    PorqueTrabajarConmigo,
)
from fastapi import HTTPException

from models.shop import Shop
from models.users import Users
from services.notificaciones import Crearnotificaion


def _obtener_tuinfo(db, id_usuario):
    buscartuinfo = db.query(TuInformacion).filter(
        TuInformacion.id_usuario == id_usuario
    ).first()

    if not buscartuinfo:
        raise HTTPException(
            status_code=404,
            detail="No se encontro informacion para el usuario",
        )

    return buscartuinfo


def _crear_hijo(db, modelo, datos):
    tuinfo = _obtener_tuinfo(db, datos.id_usuario)
    campos = datos.model_dump(exclude={"id_usuario"})
    registro = modelo(id_tu_informacion=tuinfo.id, **campos)
    db.add(registro)
    db.commit()
    db.refresh(registro)
    tienda = db.query(Shop).join(Users, Users.cedula == Shop.usuario_id).filter(
        Users.cedula == datos.id_usuario
    ).first()
    if tienda:
        Crearnotificaion(db, tienda.id, "Se creo informacion personal", "tu informacion")
    return registro


def _actualizar_hijo(db, modelo, datos):
    tuinfo = _obtener_tuinfo(db, datos.id_usuario)
    registro = db.query(modelo).filter(
        modelo.id == datos.id,
        modelo.id_tu_informacion == tuinfo.id,
    ).first()

    if not registro:
        raise HTTPException(status_code=404, detail="No se encontro el registro")

    for campo, valor in datos.model_dump(
        exclude={"id_usuario", "id"}, exclude_unset=True
    ).items():
        setattr(registro, campo, valor)

    db.commit()
    db.refresh(registro)
    tienda = db.query(Shop).join(Users, Users.cedula == Shop.usuario_id).filter(
        Users.cedula == datos.id_usuario
    ).first()
    if tienda:
        Crearnotificaion(db, tienda.id, "Se actualizo informacion personal", "tu informacion")
    return registro


def _eliminar_hijo(db, modelo, datos):
    tuinfo = _obtener_tuinfo(db, datos.id_usuario)
    registro = db.query(modelo).filter(
        modelo.id == datos.id,
        modelo.id_tu_informacion == tuinfo.id,
    ).first()

    if not registro:
        raise HTTPException(status_code=404, detail="No se encontro el registro")

    db.delete(registro)
    db.commit()
    tienda = db.query(Shop).join(Users, Users.cedula == Shop.usuario_id).filter(
        Users.cedula == datos.id_usuario
    ).first()
    if tienda:
        Crearnotificaion(db, tienda.id, "Se elimino informacion personal", "tu informacion")
    return "registro eliminado"


def actualizartuinformacion(db, datos):
    tuinfo = _obtener_tuinfo(db, datos.id_usuario)

    for campo, valor in datos.model_dump(
        exclude={"id_usuario"}, exclude_unset=True
    ).items():
        setattr(tuinfo, campo, valor)

    db.commit()
    db.refresh(tuinfo)
    tienda = db.query(Shop).join(Users, Users.cedula == Shop.usuario_id).filter(
        Users.cedula == datos.id_usuario
    ).first()
    if tienda:
        Crearnotificaion(db, tienda.id, "Se actualizo tu informacion", "tu informacion")
    return tuinfo


def actualizarfoto(db, id_usuario, url_foto):
    tuinfo = _obtener_tuinfo(db, id_usuario)
    tuinfo.foto = url_foto
    db.commit()
    db.refresh(tuinfo)
    return tuinfo


def crearquehago(db, datos):
    return _crear_hijo(db, QueHago, datos)


def actualizarquehago(db, datos):
    return _actualizar_hijo(db, QueHago, datos)


def eliminarquehago(db, datos):
    return _eliminar_hijo(db, QueHago, datos)


def crearmisespecialidades(db, datos):
    return _crear_hijo(db, MisEspecialidades, datos)


def actualizarmisespecialidades(db, datos):
    return _actualizar_hijo(db, MisEspecialidades, datos)


def eliminarmisespecialidades(db, datos):
    return _eliminar_hijo(db, MisEspecialidades, datos)


def crearcomofunciona(db, datos):
    return _crear_hijo(db, ComoFunciona, datos)


def actualizarcomofunciona(db, datos):
    return _actualizar_hijo(db, ComoFunciona, datos)


def eliminarcomofunciona(db, datos):
    return _eliminar_hijo(db, ComoFunciona, datos)


def crearinformacionservicio(db, datos):
    return _crear_hijo(db, InformacionServicio, datos)


def actualizarinformacionservicio(db, datos):
    return _actualizar_hijo(db, InformacionServicio, datos)


def eliminarinformacionservicio(db, datos):
    return _eliminar_hijo(db, InformacionServicio, datos)


def crearmiexperiencia(db, datos):
    return _crear_hijo(db, MiExperiencia, datos)


def actualizarmiexperiencia(db, datos):
    return _actualizar_hijo(db, MiExperiencia, datos)


def eliminarmiexperiencia(db, datos):
    return _eliminar_hijo(db, MiExperiencia, datos)


def crearporqueTrabajarConmigo(db, datos):
    return _crear_hijo(db, PorqueTrabajarConmigo, datos)


def actualizarporqueTrabajarConmigo(db, datos):
    return _actualizar_hijo(db, PorqueTrabajarConmigo, datos)


def eliminarporqueTrabajarConmigo(db, datos):
    return _eliminar_hijo(db, PorqueTrabajarConmigo, datos)

def traertuinfo(db, id_usuario):
    buscartuinfo = db.query(TuInformacion).filter(
        TuInformacion.id_usuario == id_usuario
    ).first()

    if not buscartuinfo:
        raise HTTPException(status_code=400, detail="error no se encontro informacion para el usuario")

    buscarquehago = db.query(QueHago).filter(
        QueHago.id_tu_informacion == buscartuinfo.id
    ).all()

    buscarmisespecialidades = db.query(MisEspecialidades).filter(
            MisEspecialidades.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarcomofunciona = db.query(ComoFunciona).filter(
            ComoFunciona.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarinformacionservicio = db.query(InformacionServicio).filter(
            InformacionServicio.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarmiexperiencia = db.query(MiExperiencia).filter(
            MiExperiencia.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarporquetrabajarconmigo = db.query(PorqueTrabajarConmigo).filter(
            PorqueTrabajarConmigo.id_tu_informacion == buscartuinfo.id
        ).all()

    return {
        "tu_informacion": buscartuinfo,
        "que_hago": buscarquehago,
        "mis_especialidades": buscarmisespecialidades,
        "como_funciona": buscarcomofunciona,
        "informacion_servicio": buscarinformacionservicio,
        "mi_experiencia": buscarmiexperiencia,
        "porque_trabajar_conmigo": buscarporquetrabajarconmigo
    }

def traerinformacioncliente(db, dominio):
    buscartienda = db.query(Shop).filter(
        Shop.dominio == dominio
    ).first()

    if not buscartienda:
        raise HTTPException(status_code=400, detail="error no se encontro una tienda asociada")

    buscarusuario = db.query(Users).filter(
        Users.cedula == buscartienda.usuario_id
    ).first()

    if not buscarusuario:
        raise HTTPException(status_code=400, detail="error no se encontro el usuario")

    buscartuinfo = db.query(TuInformacion).filter(
        TuInformacion.id_usuario == buscarusuario.cedula,
        TuInformacion.estado == True
    ).first()

    if not buscartuinfo:
            raise HTTPException(status_code=400, detail="error no se encontro informacion para el usuario")
    
    buscarquehago = db.query(QueHago).filter(
        QueHago.id_tu_informacion == buscartuinfo.id
    ).all()

    buscarmisespecialidades = db.query(MisEspecialidades).filter(
            MisEspecialidades.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarcomofunciona = db.query(ComoFunciona).filter(
            ComoFunciona.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarinformacionservicio = db.query(InformacionServicio).filter(
            InformacionServicio.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarmiexperiencia = db.query(MiExperiencia).filter(
            MiExperiencia.id_tu_informacion == buscartuinfo.id
        ).all()

    buscarporquetrabajarconmigo = db.query(PorqueTrabajarConmigo).filter(
            PorqueTrabajarConmigo.id_tu_informacion == buscartuinfo.id
        ).all()

    return {
        "tu_informacion": buscartuinfo,
        "que_hago": buscarquehago,
        "mis_especialidades": buscarmisespecialidades,
        "como_funciona": buscarcomofunciona,
        "informacion_servicio": buscarinformacionservicio,
        "mi_experiencia": buscarmiexperiencia,
        "porque_trabajar_conmigo": buscarporquetrabajarconmigo
    }
    