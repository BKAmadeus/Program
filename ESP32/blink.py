import time
from machine import Pin

led = Pin(27, Pin.OUT)        

def run():
    for i in range(10):
        led.value(1)
        time.sleep(1)
        led.value(0)
        time.sleep(1)