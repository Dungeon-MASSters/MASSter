import logging
import sys


_logger = None


def _init_logger(log_level=logging.INFO, name=None, propagate=True):
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    logger.propagate = propagate

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(logging.Formatter(fmt='[%(asctime)s: %(levelname)s] %(message)s'))
    logger.addHandler(handler)

    return logger


def get_logger(log_level=logging.INFO, name=None, propagate=True):
    global _logger

    if _logger is None:
        _logger = _init_logger(log_level, name=name, propagate=propagate)

    return _logger


def log(msg, level=logging.INFO, *args, **kwargs):
    get_logger().log(level, msg, *args, **kwargs)


def debug(msg, *args, **kwargs):
    get_logger().debug(msg, *args, **kwargs)


def info(msg, *args, **kwargs):
    get_logger().info(msg, *args, **kwargs)


def warning(msg, *args, **kwargs):
    get_logger().warning(msg, *args, **kwargs)


def error(msg, *args, **kwargs):
    get_logger().error(msg, *args, **kwargs)


def exception(msg, *args, exc_info=True, **kwargs):
    get_logger().exception(msg, *args, exc_info=exc_info, **kwargs)


def critical(msg, *args, **kwargs):
    get_logger().critical(msg, *args, **kwargs)
