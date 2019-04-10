import numpy as np
from scipy import signal
import matplotlib.pyplot as plt
from scipy.integrate import odeint

# tau * dy2/dt2 + 2*zeta*tau*dy/dt + y = Kp*u
Kp = 1.0    # gain
tau = 1.0   # time constant
zeta = 0.25 # damping factor
theta = 0.0 # no time delay

setpoint = 12.0    # change in u
startingpoint = 20
# (3) ODE Integrator
def model3(x,t):
    y = x[0] 
    dydt = x[1] 
    dy2dt2 = (-2.0*zeta*tau*dydt - y + Kp*setpoint)/tau**2
    return [dydt,dy2dt2]

t3 = np.linspace(0,25,100)
x3 = odeint(model3,[startingpoint,0],t3)
y3 = x3[:,0]

plt.figure(1)
plt.plot(t3,y3,'r-')
plt.show()