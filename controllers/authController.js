const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Revisa si el usuario está autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    // Si el usuario esta autenticado, adelante
    if(req.isAuthenticated()) {
        return next();
    }

    // Sino esta autenticado
    return res.redirect('/iniciar-sesion');
}

// Cerrar Sesión
exports.cerrarSesion = (req, res, next) => {
    req.logout(function (err) {
        if(err) {
            // Maneja el error
            console.log(err);
        }
        req.flash('exito', 'Cerraste sesión correctamente');
        res.redirect('/iniciar-sesion');
        next();
    });
}