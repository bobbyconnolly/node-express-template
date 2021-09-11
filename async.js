const getDataFromFacebook = () =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (new Date().getTime() % 10) {
                resolve("some data from Facebook")
            } else {
                reject("unable to reach server")
            }
        }, 500)
    })

const middleware3 = async (req, res, next) => {
    try {
        const data = await getDataFromFacebook()

        res.locals.data = data

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    middleware3,
}
