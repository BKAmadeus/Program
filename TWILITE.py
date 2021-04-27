#!/usr/bin/python
# coding: UTF-8
from serial import *
from sys import stdout, stdin, stderr, exit

if len(sys.argv) != 2:
    print("%s {serial port name}" % sys.argv[0])
    exit(1)

try:
    ser = Serial(sys.argv[1], 115200)
    print("open serial port: %s" % sys.argv[1])
except:
    print("cannot open serial port: %s" % sys.argv[1])
    exit(1)

def printPayload(l):
    if len(l) < 3: return False 
    
    print("  command = 0x%02x (other)" % l[1])
    print("  src     = 0x%02x" % l[0])
    
    print("  payload =")
    for c in l[2:]:
        print("%02x" % c)
    print("(hex)")
    return True
        
def printPayload_0x81(l):
    if len(l) != 23: return False 
    
    ladr = l[5] << 24 | l[6] << 16 | l[7] << 8 | l[8]
    print("  command   = 0x%02x (data arrival)" % l[1])
    print("  src       = 0x%02x" % l[0])
    print("  src long  = 0x%08x" % ladr)
    print("  dst       = 0x%02x" % l[9])
    print("  pktid     = 0x%02x" % l[2])
    print("  prtcl ver = 0x%02x" % l[3])
    print("  LQI       = %d / %.2f [dbm]" % (l[4], (7*l[4]-1970)/20.))
    ts = l[10] << 8 | l[11]
    print("  time stmp = %.3f [s]" % (ts / 64.0))
    print("  relay flg = %d" % l[12])
    vlt = l[13] << 8 | l[14]
    print("  volt      = %04d [mV]" % vlt)
    
    dibm = l[16]
    dibm_chg = l[17]
    di = {} 
    di_chg = {} 
    for i in range(1,5):
        di[i] = 0 if (dibm & 0x1) == 0 else 1
        di_chg[i] = 0 if (dibm_chg & 0x1) == 0 else 1
        dibm >>= 1
        dibm_chg >>= 1
        pass
    
    print("  DI1=%d/%d  DI2=%d/%d  DI3=%d/%d  DI4=%d/%d" % (di[1], di_chg[1], di[2], di_chg[2], di[3], di_chg[3], di[4], di_chg[4]))
    
    ad = {}
    er = l[22]
    for i in range(1,5):
        av = l[i + 18 - 1]
        if av == 0xFF:
            
            ad[i] = -1
        else:
            ad[i] = ((av * 4) + (er & 0x3)) * 4
        er >>= 2
    print("  AD1=%04d AD2=%04d AD3=%04d AD4=%04d [mV]" % (ad[1], ad[2], ad[3], ad[4]))
    
    return True

while True:
    line = ser.readline().rstrip() 

    if len(line) > 0 and line[0] == ':':
        print("\n%s" % line)
    else:
        continue

    try:
        lst = map(ord, line[1:].decode('hex')) 
        csum = sum(lst) & 0xff
        lst.pop() 
        if csum == 0:
            if lst[1] == 0x81:
                printPayload_0x81(lst) 
            else:
                printPayload(lst) 
        else:
            print("checksum ng")
    except:
        print("  skip")
