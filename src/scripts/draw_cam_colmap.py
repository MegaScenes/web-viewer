import numpy as np


def qvec2rotmat(qvec):
    return np.array(
        [
            [
                1 - 2 * qvec[2] ** 2 - 2 * qvec[3] ** 2,
                2 * qvec[1] * qvec[2] - 2 * qvec[0] * qvec[3],
                2 * qvec[3] * qvec[1] + 2 * qvec[0] * qvec[2],
            ],
            [
                2 * qvec[1] * qvec[2] + 2 * qvec[0] * qvec[3],
                1 - 2 * qvec[1] ** 2 - 2 * qvec[3] ** 2,
                2 * qvec[2] * qvec[3] - 2 * qvec[0] * qvec[1],
            ],
            [
                2 * qvec[3] * qvec[1] - 2 * qvec[0] * qvec[2],
                2 * qvec[2] * qvec[3] + 2 * qvec[0] * qvec[1],
                1 - 2 * qvec[1] ** 2 - 2 * qvec[2] ** 2,
            ],
        ]
    )


qvec = [
    0.9990926759388453,
    0.041015142534461625,
    -0.006827321814614928,
    0.009217952325488814,
]
tvec = [-0.13173343396334097, 2.956248679762018, 1.8841122492704774]
R = qvec2rotmat(qvec)
R_T = R.T
t = -R_T @ tvec
print("R_T: ", R_T)
print("t: ", t)

model = "SIMPLE_RADIAL"
params = [1476.124535197411, 390, 520, 0.10500275806299399]
if model in ("SIMPLE_PINHOLE", "SIMPLE_RADIAL", "RADIAL"):
    fx = fy = params[0]
    cx = params[1]
    cy = params[2]
elif model in (
    "PINHOLE",
    "OPENCV",
    "OPENCV_FISHEYE",
    "FULL_OPENCV",
):
    fx = params[0]
    fy = params[1]
    cx = params[2]
    cy = params[3]
print(fx, fy, cx, cy)
K = np.identity(3)
K[0, 0] = fx
K[1, 1] = fy
K[0, 2] = cx
K[1, 2] = cy

w = 780
h = 1040
scale = 0.25

K = K.copy() / scale
print("K: ", K)
Kinv = np.linalg.inv(K)
print("Kinv: ", Kinv)
T = np.column_stack((R_T, t))
T = np.vstack((T, (0, 0, 0, 1)))
print("T: ", T)
