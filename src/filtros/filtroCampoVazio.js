const filtroCampoVazio = async (req, res, next) => {

    for (const prop in req.body) {
        if (req.body[prop].length === 0) {
            delete req.body[prop]
        }
    }
    next();
}

module.exports = filtroCampoVazio;