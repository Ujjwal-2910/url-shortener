import express from 'express';
const router = express.Router();

export default router.get("/", async (req, res) => {
    try {
        res.json({
            status: 200,
            message: "Successfull"
        }); 
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error");
    }
});