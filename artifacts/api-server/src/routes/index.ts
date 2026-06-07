import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import tokensRouter from "./tokens";
import messagesRouter from "./messages";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(tokensRouter);
router.use(messagesRouter);
router.use(statsRouter);

export default router;
