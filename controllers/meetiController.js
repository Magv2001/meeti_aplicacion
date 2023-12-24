const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const Usuarios = require('../models/Usuarios');

// Muestra el formulario para nuevos Meeti
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id }});

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
}

// Inserta nuevos Meeti en la BD
exports.crearMeeti = async (req, res) => {
    // Obtener los datos
    const meeti = req.body;

    // Asignar el usuario
    meeti.usuarioId = req.user.id;

    // Almacena la ubicación con un point

    const point = { type: 'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng) ] };
    meeti.ubicacion = point;

    // Cupo opcional
    if(req.body.cupo === '') {
        meeti.cupo = 0;
    }

    // Almacenar en la BD
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

// Sanitiza los meeti
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('provincia');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
}

// Muestra el formulario para editar un meeti
exports.formEditarMeeti = async (req, res, next) => {
    const consultas =[];
    consultas.push( Grupos.findAll({ where: { usuarioId: req.user.id }}) );
    consultas.push( Meeti.findByPk(req.params.id) );

    // Return un promise
    const [ grupos, meeti ] = await Promise.all(consultas);

    if(!grupos || !meeti ){
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Mostramos la vista
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti : ${meeti.titulo}`,
        grupos,
        meeti
    })
}

// Almacenar los cambios en el meeti (BD)
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Asignar los valores 
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, provincia, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.provincia = provincia;
    meeti.pais = pais;

    // Asignar point (ubicacion)
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    // Almacenar en la BD
    await meeti.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');
}

// Muestra el listado de asistentes
exports.asistentesMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
                                    where: { slug: req.params.slug },
                                    attributes: ['interesados']
    });

    // Extraer interesados
    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: { id: interesados }
    });

    // Crear la vista y pasar datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    })
}

// Muestra un formulario para eliminar meeti's
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Mostrar la vista
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    })
}

// Elimina el Meeti de la BD
exports.eliminarMeeti = async (req, res) => {
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    });

    req.flash('exito', 'Meeti Eliminado');
    res.redirect('/administracion');
}