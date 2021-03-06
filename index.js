const express = require("express")

const app = express()

// According to the Express docs, middleware can:
// - Execute any code
// - Make changes to the request and the response objects
// - End the request-response cycle
// - Call the next middleware function in the stack

// source: https://expressjs.com/en/guide/using-middleware.html

/////////////////////////////////////////////////////////////////////
/////////////////////////// EXAMPLE 1 ///////////////////////////////
/////////////////////////////////////////////////////////////////////

// Be sure to call next() once and only once to move onto the next middleware
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
    // You can access the data that the middlewares processed inside res.locals
    res.json(res.locals)
})

/////////////////////////////////////////////////////////////////////
/////////////////////////// EXAMPLE 2 ///////////////////////////////
/////////////////////////////////////////////////////////////////////

// This middleware tries to get the username from the userId (0, 1, or 2)
const usersMiddleware = (req, res, next) => {
    const { userId } = req.params

    if (!userId.match(/^[1-9][0-9]?$/)) {
        // Calling next() with an argument jumps straight to the error handler
        // Be sure to ~return~ as we don't want to execute any more of this function
        return next("invalid userId")
    }

    res.locals.user = ["taco", "smokey", "ginger"][parseInt(userId)]

    if (!res.locals.user) {
        // You can put the ~return~ statement alone on its own line... it makes no difference
        next("user not found")
        return
    }

    next()
}

const userRouter = express.Router()

// Let's put all the paths with "/user/:userId" behind userMiddleware
app.use("/user/:userId", usersMiddleware, userRouter)

userRouter.get("/", (req, res) => {
    res.json(res.locals.user)
})

userRouter.get("/food", (req, res) => {
    const food = res.locals.user === "taco" ? "tacos" : "salmon"
    res.send(food)
})

/////////////////////////////////////////////////////////////////////
/////////////////////////// EXAMPLE 3 ///////////////////////////////
/////////////////////////////////////////////////////////////////////

// This is an async example (see async.js)... it fails every 1/10 times

const { middleware3 } = require("./async")

// It's just a single middleware so no need to put it in an array as in Example 1
app.get("/async", middleware3, (req, res) => {
    res.send(res.locals.data)
})

/////////////////////////////////////////////////////////////////////
/////////////////////////// EXAMPLE 4 ///////////////////////////////
/////////////////////////////////////////////////////////////////////

// Error middleware (think catch) must have 4 parameters in the correct order

// A simple error logging middleware
app.use((err, req, res, next) => {
    console.error(`ERROR ${err}`)

    // Forward the error to next middleware
    next(err)
})

// Default error handler
// Even though we don't use it, you absolutely must put `next` in the parameter list or else Express will not recognize this function as an error handler
app.use((err, req, res, next) => {
    res.json({ error: err })
})

// Catch-all route
// Basically, if there was no match, this matches everything
// In general, make sure this is the last route specified
app.use("/", (req, res) => {
    res.send("sorry, can't help you")
})

app.listen(3000, () => {
    console.log("server is running")
})
