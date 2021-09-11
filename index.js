const express = require("express")

const app = express()

// Functions that don't close the stream are called "middleware"

// Be sure to call next() once (and only once) to move onto the next middleware
// Failing to do so will cause the client to hang
const middleware1 = (req, res, next) => {
    res.locals.m1 = "hi from m1"
    next()
}

const middleware2 = (req, res, next) => {
    res.locals.m2 = "hi from m2"
    next()
}

// Multiple middleware can be applied (in order) by using an array
app.get("/", [middleware1, middleware2], (req, res) => {
    res.json(res.locals)
})

// This middleware tries to get the username from the userId (0, 1, or 2)
const usersMiddleware = (req, res, next) => {
    const { userId } = req.params
    if (!userId.match(/^[1-9][0-9]?$/)) {
        // Calling next() with an argument jumps straight to the error handler
        // Be sure to ~return~ as we don't want to execute any more of this function
        // You can put the ~return~ statement alone on its own line... it makes no difference
        return next("invalid userId")
    }

    res.locals.user = ["taco", "smokey", "ginger"][parseInt(userId)]

    next()
}

const userRouter = express.Router()

// Let's put all the paths with "/user/:userId" behind usersMiddleware
app.use("/user/:userId", usersMiddleware, userRouter)

userRouter.get("/", (req, res) => {
    res.json(res.locals.user)
})

userRouter.get("/food", (req, res) => {
    const food = res.locals.user === "taco" ? "tacos" : "salmon"
    res.send(food)
})

// Error middleware (think catch) must have 4 parameters in the correct order

// A simple error logging middleware
app.use((err, req, res, next) => {
    console.error(err)
    next(err) // forward to next middleware
})

// Default error handler
app.use((err, req, res, next) => {
    res.json({ error: err })
})

// Route not found handler
app.use("/", (req, res) => {
    res.send("sorry, can't help you")
})

app.listen(3000, () => {
    console.log("server is running")
})
