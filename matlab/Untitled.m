%{
D = deg2rad(180);
disp(D);
c = cos(D);
disp(c);
disp(acos(c));
disp(rad2deg(acos(c)));
x1 = 5;
z1 = 1;
x2 = 5;
z2 = 5;
%x3 = 5;
%z3 = 2;
rad = getRadian2D(x1, z1, x2, z2);
%rad2 = getRadian2D(x3, z3, x2, z2);
disp(rad2deg(rad));
%disp(rad2);

x1 = 5;
y1 = 1;
x2 = 25;
y2 = 40;
rad = getRadian2D(x1, y1, x2,  y2);
rad1 = getRadian2D(x2, y2, x1,  y1);
disp(rad2deg(rad));
disp(rad2deg(rad1));

disp(rad2deg(rad) - rad2deg(rad1));
closs = getCloss(x1,y1,x2,y2,rad);


x1 = 113;
y1 = 61;
z1 = 280.7;
x2 = 117;
y2 = 46;
z2 = 294.07;
d = getDistance3D(x1*3.9,y1*3.9,z1,x2*3.9,y2*3.9,z2);
disp("distance");
disp(d);
threshold = -90;
frequency = 2400;
frequency1 = 920;
d = ((300 / frequency1) * 10.^(-threshold / 20)) / (4 * pi);
d1 = sqrt((0.21*0.21*(300 / frequency)^2 * 10.^(-threshold / 10)) / (4 * pi)^2);
d2 = sqrt((0.08*0.08*(300 / frequency1)^2 * 10.^(-threshold / 10)) / (4 * pi)^2);
disp([d d1 d2]);
gain = calFreeSpaceGain24(d1,frequency);
disp(gain);
gain = calFreeSpaceGain92(d2,frequency1);
disp(gain);
gain = calFreeSpaceGain(d,frequency1);
disp(gain);
%}
x1 = 113;
y1 = 61;
x2 = 117;
y2 = 46;

disp((y2-y1)/(x2-x1));

function gain = calFreeSpaceGain24(dist, freq)
    ds = (4 * pi)^2 * (dist^2);
    lambda = 300/freq;
    GrGtLa = 0.21*0.21*lambda^2;
    gain = 10*log10(GrGtLa / ds);
end

function gain = calFreeSpaceGain92(dist, freq)
    ds = (4 * pi)^2 * (dist^2);
    lambda = 300/freq;
    GrGtLa = 0.08*0.08*lambda^2;
    gain = 10*log10(GrGtLa / ds);
end

function gain = calFreeSpaceGain(dist, freq)
    ds = (4 * pi)^2 * dist^2;
    lambda = 300/freq;
    GrGtLa = lambda^2;
    gain = 10*log10(GrGtLa / ds);
end

function closs = getCloss(x1,y1,x2,y2,rad)
    t1 = (y1 - y2)/(x1 - x2);
    s1 = ((y1 - y2)/(x1 - x2)) * -x2 + y2;
    t2 = (y2 - y1)/(x2 - x1);
    s2 = ((y2 - y1)/(x2 - x1)) * -x1 + y1;
    tho = 0.3;
    disp([t1 s1]);
    disp([t2 s2]);
    t1 = t1 - tho;
    t2 = t2 + tho;
    x3 = (s2-s1)/(t1-t2);
    y3 = x3*t1+s1;
    disp([x3 y3]);
    closs = 0;
end

function rad = getRadian2D(x1, z1, x2,  z2)
    rad = atan2(z2 - z1,x2 - x1);
end

function d = getDistance3D(x1, y1, z1, x2, y2, z2)
    d = sqrt((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2);
end