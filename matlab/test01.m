function test01()
    clear
        disp('********** SLMULATION START ********'); 
        tic
        interval = 0.2;
        inputXML = 'Practice\node.xml';
        xml = xmlread( inputXML );
        commonInfo = inputInfo(xml);
        nodeList = inputNodes(xml);
        threshold = commonInfo.threshold;
        frequency = commonInfo.frequency;
        maxh = commonInfo.heightMax;
        minh = commonInfo.heightMin;
        gioData = dlmread('Practice\map.csv');
        latlon = dlmread('Practice\latlon.csv');
        fclose('all');
        [m,n] = size(gioData);
        xyz = zeros(numel(nodeList),3);
        [xpixel,ypixel,lat,lon] = PixelLatLon(m,n,latlon);
        xyz = xyzCreat(gioData, nodeList, lat, lon, xyz);
        [xRSSI,yRSSI] = FreeRSSICreat(threshold,frequency,xpixel,ypixel);
        scrsz = get(groot,'ScreenSize');
        figure('Position', scrsz);
        set(gca,'YDir','reverse');
        WaveMap = int64(zeros(m,n));
        MAPS(:,:,1) = zeros(m,n);
        MAPS(:,:,2) = zeros(m,n);
        MAPS(:,:,3) = zeros(m,n);
        height = HeightMatrixCreat(MAPS(:,:,1),xyz,nodeList,maxh);
        maps = NaN(m,n);
        %�n�_���Ƃ�RSSI臒l�����ߔz���Ԃ�
        for i = 1:numel(nodeList)
            xyse = LoopStartEnd(xyz(i,:),xRSSI,yRSSI,m,n);
            PointThreshold = ElectromagneticWaveThreshold(xpixel,ypixel,frequency,gioData,xyz(i,:),xyse,height);
            [WaveMap,MAPS,maps] = ElectromagneticWaveMap(PointThreshold,WaveMap,threshold,i,xyse,MAPS,maps,gioData);
        end
        nodeList = DrawLine(xyz,WaveMap,nodeList,xpixel,ypixel);
        makeOutputXML(nodeList,commonInfo,'Middle\node.xml');
        dlmwrite('Middle\Aggregation.csv',MAPS(:,:,1));
        dlmwrite('Middle\map.csv',gioData);
        ConnectMini = ConnectMinimum(nodeList);
        %�m�[�h�ǉ����s���z��Ɋi�[����
        while numel(ConnectMini) ~= numel(find(ConnectMini == 1))
            [AddPoint,MtMax] = OverLap(xpixel,ypixel,gioData,nodeList,MAPS(:,:,1),WaveMap,ConnectMini,height,frequency,xyz);
            if MtMax == 0.25
                 [AddPoint] = FarDeploy(xpixel,ypixel,MAPS,gioData,WaveMap,ConnectMini,nodeList,height,frequency,xyz);
            end
            h = NewNodeHeight(xpixel,ypixel,WaveMap,nodeList,gioData,xyz,minh,maxh,interval,frequency,threshold,AddPoint);
            height(AddPoint(2),AddPoint(1)) = h;
            [xyz,nodeNum,nodeList] = AddnodeList(nodeList,AddPoint,xyz,lat,lon,h);
            xyse = LoopStartEnd(AddPoint,xRSSI,yRSSI,m,n);
            AddPointThreshold = ElectromagneticWaveThreshold(xpixel,ypixel,frequency,gioData,xyz(nodeNum,:),xyse,height);
            [WaveMap,MAPS,maps] = ElectromagneticWaveMap(AddPointThreshold,WaveMap,threshold,nodeNum,xyse,MAPS,maps,gioData);
            nodeList = DrawLine(xyz,WaveMap,nodeList,xpixel,ypixel);
            ConnectMini = ConnectMinimum(nodeList);
        end
        dlmwrite('result\result_Aggregation.csv',MAPS(:,:,1));
        DrawPoint(gioData,nodeList,xyz,xpixel,ypixel,maps,MAPS);
        savefig("untitled.fig");
        makeOutputXML(nodeList,commonInfo,'result\result_node.xml');
        toc
end

function h = NewNodeHeight(xpixel,ypixel,WaveMap,nodeList,gioData,xyz,minh,maxh,interval,frequency,threshold,AddPoint)
    n = WaveMap(AddPoint(2),AddPoint(1));
    n = dec2bin(n,numel(nodeList));
    A = abs(find(n == int2str(1)) - numel(nodeList)) + 1;
    A = horzcat(AddPoint(4),A);
    All = [];
    for i = maxh:-interval:minh
        At = [AddPoint(1) AddPoint(2) AddPoint(3)+i];
        [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(xyz(A,1),xyz(A,2),xyz(A,3),At,gioData,0);
        Threshold = ThresholdGain(xpixel,ypixel,frequency,At,xyz(A,3),MaxElevation,xyz(A,1),xyz(A,2),XElevation,YElevation,ZElevation);
        All = horzcat(All,Threshold);
    end
    [m,n] = size(All);
    a = ((All(1,:) - All(1,1)) < 0.1);
    b = (All(2:m,:) > threshold);
    c = maxh:-interval:minh;
    for i = n:-1:1
        if ((a(i) == 1) && (sum(b(:,i)) == m - 1))
            h = c(i);
            break;
        end
    end
end

function height = HeightMatrixCreat(height,xyz,nodeList,Max)
    height(height == 0) = Max;
    for i = 1:numel(nodeList)
        height(xyz(i,2),xyz(i,1)) = nodeList.height;
    end
end

function [xpixel,ypixel,lat,lon] = PixelLatLon(col,raw,latlon)
    lat = latlon(1,1:col);
    lon = latlon(2,1:raw);
    xpixel = latlon(3,1);
    ypixel = latlon(3,2);
    disp(xpixel);
    disp(ypixel);
end


function Point = FarDeploy(xpixel,ypixel,MAPS,gioData,WaveMap,ConnectMini,nodeList,height,frequency,xyz)
    Point = [0 0 0 0];
    [m,n] = size(gioData);
    MAP = zeros(m,n);
    dMax = -10000;
    Wave = dec2bin(WaveMap);
    A = find(ConnectMini ~= 1);
    nMax = numel(nodeList);
    B = find(ConnectMini == A(1));
    for k = B
        C = find(Wave(:,nMax - (k-1)) == int2str(1));
        for i = C
            MAP(i) = MAP(i) + 0.25;
        end
    end
    MAPS(:,:,1) = MAPS(:,:,1) - MAP;
    [X,Y] = meshgrid(1:n,1:m);
    CI = find(MAPS(:,:,1) ~= 0);
    XI = X(CI);
    YI = Y(CI);
    Data = gioData(CI);
    hi = height(CI);
    [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(XI,YI,Data,xyz(A(1),:),gioData,hi);
    PointThreshold = ThresholdGain(xpixel,ypixel,frequency,xyz(A(1),:),Data+hi,MaxElevation,XI,YI,XElevation,YElevation,ZElevation);
    [fMax,MaxIndex] = max(PointThreshold);
    Point(1) = XI(MaxIndex);
    Point(2) = YI(MaxIndex);
    Point(3) = Data(MaxIndex);
    Point(4) = A(1);
end

function ConnectMini = ConnectMinimum(nodeList)
    ConnectMini = 1:numel(nodeList);
    
    CheckMini = ConnectMini;
    CheckMini(1) = 0;
    while isequal(CheckMini,ConnectMini) ~= 1
        CheckMini = ConnectMini;
        for i = 1:numel(nodeList)
            for j = 1:nodeList(i).connectable
                if ConnectMini(i) > ConnectMini(nodeList(i).connected(j))
                    ConnectMini(i) = ConnectMini(nodeList(i).connected(j));
                end
            end
        end
    end
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%�m�[�h��ǉ����鏈��
%�m�[�h�ʒu��xyz�ϐ��AnodeList�����X�V����
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function [xyz,nodeNum,nodeList] = AddnodeList(nodeList,AddPoint,xyz,lat,lon,h)
    latitude = lat(AddPoint(2));
    longitude = lon(AddPoint(1));
    nodeNum = numel(nodeList) + 1;
    nodeList(nodeNum).no        = nodeNum;
    nodeList(nodeNum).type      = 'rt';
    nodeList(nodeNum).lon       = longitude;
    nodeList(nodeNum).lat       = latitude;
    nodeList(nodeNum).height    = h;
    nodeList(nodeNum).connected = NaN;
    nodeList(nodeNum).connectable = 0;
    Add = [AddPoint(1) AddPoint(2) AddPoint(3)+h];
    xyz = vertcat(xyz,Add);
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%�ǉ��m�[�h�ݒu�ʒu�����߂�֐�
%�q�����Ă���_���Ȃ����Œ������ł������_�����
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function [Point,MtMax] = OverLap(xpixel,ypixel,Matrix,nodeList,Aggregation,WaveMap,ConnectMini,height,frequency,xyz)
    Point = [0 0 0 0];
    [m,n] = size(Matrix);
    nMax = numel(nodeList);
    Wave = dec2bin(WaveMap);
    diffMax = -10000;
    for i = 1:nMax
        A = find(ConnectMini == ConnectMini(i));
        for k = A
            if nMax - (i-1) ~= nMax - (k-1)
                nfield = find(Wave(:,nMax - (i-1)) == int2str(1) & Wave(:,nMax - (k-1)) == int2str(1));
                for j = nfield
                    Wave(j,nMax - (k-1)) = '0';
                    Aggregation(j) = Aggregation(j) - 0.25;
                end
            end
        end
    end
    MtMax = max(max(Aggregation));
    ConnectWave = fliplr(ConnectMini);
    if MtMax ~= 0.25
        nodeThreshold = [0 0];
        %ChackIndex�@���ׂ鉿�l�̂���C���f�b�N�X�ԍ��z��
        CI = find(Aggregation == MtMax);
        %disp(Wave(CI,:));
        t = size(CI);
        a = (Wave(CI,:) == int2str(1));
        b = a .* ConnectWave;
        c = find(b);
        d = b(c);
        e = reshape(d,[t(1),MtMax*4]);
        f = (Wave(CI,:) == 1);
        f = ConnectWave + f;
        for i = 1:(MtMax*4)
            f(f == e(:,i)) = 0;
        end
        [XI,YI] = meshgrid(1:n,1:m);
        X = XI(CI);
        Y = YI(CI);
        Data = Matrix(CI);
        hi = height(CI);
        fMax = diffMax;
        for i = 1:nMax
            CIf = find(f(:,i) ~= 0);
            t = size(CIf);
            if t(1) ~= 0
                [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(xyz(:,1),xyz(:,2),xyz(:,3),xyz(nMax - i + 1,:),Matrix,0);
                PointThreshold = ThresholdGain(xpixel,ypixel,frequency,xyz(nMax - i + 1,:),xyz(:,3),MaxElevation,xyz(:,1),xyz(:,2),XElevation,YElevation,ZElevation);
                nodeThreshold = maxk(PointThreshold,2);
                XE = X(CIf);
                YE = Y(CIf);
                M = Data(CIf);
                hig = hi(CIf);
                [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(XE,YE,M,xyz(nMax - i + 1,:),Matrix,hig);
                PointThreshold = ThresholdGain(xpixel,ypixel,frequency,xyz(nMax - i + 1,:),M+hig,MaxElevation,XE,YE,XElevation,YElevation,ZElevation);
                PointThreshold = PointThreshold - nodeThreshold(2);
                [fMax,MaxIndex] = max(PointThreshold);
            end
            if t(1) == 0
                [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(X,Y,Data,xyz(nMax - i + 1,:),Matrix,hi);
                PointThreshold = ThresholdGain(xpixel,ypixel,frequency,xyz(nMax - i + 1,:),Data+hi,MaxElevation,X,Y,XElevation,YElevation,ZElevation);
                [fMax,MaxIndex] = max(PointThreshold);
            end
            if diffMax < (fMax)
                Point(1) = X(MaxIndex);
                Point(2) = Y(MaxIndex);
                Point(3) = Data(MaxIndex);
                diffMax = fMax;
                Point(4) = nMax - i + 1;
            end
        end
    end
    %disp(WaveMap(Point(2),Point(1)));
    %disp(AllPoint(count,:));
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%�O���t�Ɍq����̂���m�[�h�����ɐ�������
%nodeList.connected�X�V
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function nodeList = DrawLine(xyz,WaveMap,nodeList,xpixel,ypixel)
    for i = 1:numel(nodeList)
        n = WaveMap(xyz(i,2),xyz(i,1));
        n = dec2bin(n,numel(nodeList));
        d = dec2bin(2^(i - 1),numel(nodeList));
        n = n - d;
        A = abs(find(n == 1) - numel(nodeList)) + 1;
        count = 1;
        for j = A
            nodeList(i).connected(count) = j;
            count = count + 1;
            hold on
            plot3([xyz(i,1)*xpixel xyz(j,1)*xpixel],[xyz(i,2)*ypixel xyz(j,2)*ypixel],[xyz(i,3) xyz(j,3)],'-black', 'LineWidth',2);
            hold off
        end
        nodeList(i).connectable = count - 1;
    end
end

function [xRSSI,yRSSI] = FreeRSSICreat(threshold,frequency,xpixel,ypixel)
    d = ((300 / frequency) * 10.^(-threshold / 20)) / (4 * pi);
    % d�͋���[m]�Ń��b�V����m�Ԋu�ł���A�P�m�[�h���Ƃ̒��a���~��������2�{����
    xRSSI = fix(d/xpixel*2); 
    yRSSI = fix(d/ypixel*2);
end
%************************************************************
% �m�[�h���̓���
% xml�t�@�C���̃m�[�h�Ɋւ������ǂݎ��
%************************************************************
function nodeList = inputNodes(xml)
    %XML�t�@�C���̉���
    commentViewFlag = 0;
    if commentViewFlag == 1
        disp('***** INPUT XML FILE *****');
    end
    
    %�\���̂̒�`
    nodeList = struct('no', nan, 'type', nan, 'x', nan, 'y', nan, 'height', nan, 'connected', nan, 'connectable', nan);
    
    allNodes = xml.getElementsByTagName('node');   %'node'�^�O�̊K�w���X�g�擾
    nodeNum = allNodes.getLength;   %�m�[�h��
    
    for i = 0:nodeNum-1
        thisNode = allNodes.item(i);
        nodeList(i+1).no        = str2double(thisNode.getElementsByTagName('no').item(0).getTextContent);
        nodeList(i+1).type      = thisNode.getElementsByTagName('type').item(0).getTextContent;
        nodeList(i+1).lon       = str2double(thisNode.getElementsByTagName('lon').item(0).getTextContent);
        nodeList(i+1).lat       = str2double(thisNode.getElementsByTagName('lat').item(0).getTextContent);
        nodeList(i+1).height    = str2double(thisNode.getElementsByTagName('height').item(0).getTextContent);
        nodeList(i+1).connected = NaN;

        if (strcmp(nodeList(i+1).type, 'cd'))
            nodeList(i+1).connectable = 1;
        else
            nodeList(i+1).connectable = 0;
        end
        
        if commentViewFlag == 1
            text = ['Node No: ', num2str(i+1)];   disp(text);
            if (strcmp(nodeList(i+1).type, 'ed')); disp('  type      = ed'); end
            if (strcmp(nodeList(i+1).type, 'rt')); disp('  type      = rt'); end
            if (strcmp(nodeList(i+1).type, 'cd')); disp('  type      = cd'); end
            text = ['  lon       = ', num2str(nodeList(i+1).lon)];       disp(text);
            text = ['  lat       = ', num2str(nodeList(i+1).lat)];       disp(text);
            text = ['  height    = ', num2str(nodeList(i+1).height)];    disp(text);
            text = ['  connected = ', num2str(nodeList(i+1).connected)]; disp(text);
            text = ['  connectable = ',num2str(nodeList(i+1).connectable)];       disp(text);
        end
    end
end


function xyz = xyzCreat(gioData, nodeList, lat, lon, xyz)
    for i = 1:numel(nodeList)
        xyz(i,1) = Nearest(lon,nodeList(i).lon);
        xyz(i,2) = Nearest(lat,nodeList(i).lat);
        xyz(i,3) = nodeList(i).height + gioData(xyz(i,2), xyz(i,1));
    end
end

function i = Nearest(array,t)
    array = abs(array - t);
    i = find( array == min(array));
end

function DrawPoint(gioData, nodeList,xyz,xpixel,ypixel,maps,MAPS)
    nodeNum = numel(nodeList);  %�S�m�[�h��
    hold on    % ���W���̌Œ�
    [m,n] = size(gioData);
    [X,Y] = meshgrid(1:n,1:m);
    contour3(X*xpixel,Y*ypixel,gioData,70);
    MAPS(:,:,1) = 1 - MAPS(:,:,1);
    MAPS(:,:,3) = MAPS(:,:,1);
    MAPS(:,:,2) = MAPS(:,:,1);
    MAPS(:,:,1) = MAPS(:,:,1) - MAPS(:,:,1);
    
    s = surf(X*xpixel,Y*ypixel,maps,MAPS,'LineStyle' ,'none');
    alpha(s,.5);
    % �m�[�h�̕`��
    for i = 1:nodeNum
        % �[�����G���h�f�o�C�X
        if (strcmp(nodeList(i).type, 'ed'))
            scatter3(xyz(i,1)*xpixel, xyz(i,2)*ypixel, xyz(i,3)+10, 300,'white','filled','o','LineWidth',2,'MarkerEdgeColor','k');
        % �[�����G���h�f�o�C�X
        elseif (strcmp(nodeList(i).type, 'rt'))
            scatter3(xyz(i,1)*xpixel, xyz(i,2)*ypixel, xyz(i,3)+10, 300 ,'white','filled','^','LineWidth',2,'MarkerEdgeColor','k'); %[R,G,B]
        % �[�����G���h�f�o�C�X
        elseif (strcmp(nodeList(i).type, 'cd'))
            scatter3(xyz(i,1)*xpixel, xyz(i,2)*ypixel, xyz(i,3)+10, 600,'white','filled','p','LineWidth',2,'MarkerEdgeColor','k');
        end
        % �[�����̕`��
         text(xyz(i,1)*xpixel+10, xyz(i,2)*ypixel , xyz(i,3) + 30, num2str(nodeList(i).no) ,'Color','white','FontSize',15);
    end

    hold off   %���W���̊J��
    title('�l�b�g���[�N');
end

function PointThreshold = ElectromagneticWaveThreshold(xpixel,ypixel,frequency,gioData,xyz,xyse,height)
    Data = gioData(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2));
    high = height(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2));
    [X,Y] = meshgrid(xyse(1,1):xyse(1,2),xyse(2,1):xyse(2,2));
    %d = getDistance3D(xyz(1)*xpixel,xyz(2)*ypixel,xyz(3),X*xpixel,Y*ypixel,gioData);
    %FreR = sqrt(300/f*d)/2;
    [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(X,Y,Data,xyz,gioData,high);%FreR
    PointThreshold = ThresholdGain(xpixel,ypixel,frequency,xyz,Data+high,MaxElevation,X,Y,XElevation,YElevation,ZElevation);
end

function Threshold = ThresholdGain(xpixel,ypixel,frequency,xyz,gioData,MaxElevation,X,Y,XElevation,YElevation,ZElevation)
    Threshold = zeros(size(gioData));
    CALFREE = find(MaxElevation <= 0);
    d = getDistance3D(xyz(1)*xpixel,xyz(2)*ypixel,xyz(3),X(CALFREE)*xpixel,Y(CALFREE)*ypixel,gioData(CALFREE));
    f = calFreeSpaceGain(d,frequency);
    Threshold(CALFREE) = f;
    
    KNIFEEDGE = find(MaxElevation > 0);
    d = getDistance3D(xyz(1)*xpixel,xyz(2)*ypixel,xyz(3),X(KNIFEEDGE)*xpixel,Y(KNIFEEDGE)*ypixel,gioData(KNIFEEDGE));
    d1 = getDistance3D(xyz(1)*xpixel,xyz(2)*ypixel,xyz(3),XElevation(KNIFEEDGE)*xpixel,YElevation(KNIFEEDGE)*ypixel,ZElevation(KNIFEEDGE));
    d2 = getDistance3D(XElevation(KNIFEEDGE)*xpixel,YElevation(KNIFEEDGE)*ypixel,ZElevation(KNIFEEDGE),X(KNIFEEDGE)*xpixel,Y(KNIFEEDGE)*ypixel,gioData(KNIFEEDGE));
    v = KnifeEdgeParameter(frequency,d1,d2,MaxElevation(KNIFEEDGE));
    f = calFreeSpaceGain(d, frequency);
    Threshold(KNIFEEDGE) = f - v;
end

function [MaxElevation,XElevation,YElevation,ZElevation] = StraightPosition(X,Y,Data,xyz,gioData,high)%FreR
    MinY = Y;
    MaxY = Y;
    MinX = X;
    MaxX = X;
    MinY(Y >= xyz(2)) = xyz(2);
    MaxY(Y <= xyz(2)) = xyz(2);
    MinX(X >= xyz(1)) = xyz(1);
    MaxX(X <= xyz(1)) = xyz(1);
    MT = ((MaxX - MinX) > (MaxY - MinY));
    Min = MinY;
    Min(MT) = MinX(MT);
    Max = MaxY;
    Max(MT) = MaxX(MT);
    
    AT = Max - Min;
    s = min(min(AT));
    e = max(max(AT));
    
    Tilt = (xyz(2) - Y)./(xyz(1) - X);
    Section = Tilt .* -X + Y;
    T = (xyz(1) - X)./(xyz(2) - Y);
    S = T .* -Y + X;
    T(MT) = Tilt(MT);
    S(MT) = Section(MT);
    
    m = size(gioData);
    MaxElevation = zeros(size(Tilt));
    XElevation = X;
    YElevation = Y;
    ZElevation = Data;
    
    xy = zeros(size(Tilt));
    xy(MT) = xyz(1);
    xy(~MT) = xyz(2);
    XY = Y;
    XY(MT) = X(MT);
    
    TI = (Data + high - xyz(3)) ./ (XY - xy);
    SE = TI .* -xy + xyz(3);
    for i = s:e
        Ri = (AT >= i);
        R = Max;
        R(Ri) = R(Ri) - i;
        R2 = round(R .* T + S);
        RX = R;
        RX(~MT) = R2(~MT);
        RY = R;
        RY(MT) = R2(MT);
        Index = int64(RX - 1) * m(1) + int64(RY);
        Z = gioData(Index);
        RZ = Z - (R .* TI + SE);
        chack = (MaxElevation < RZ);
        MaxElevation(chack) = RZ(chack);
        XElevation(chack) = RX(chack);
        YElevation(chack) = RY(chack);
        ZElevation(chack) = Z(chack);
    end
    MaxElevation = round(MaxElevation,1);
end

function xyse = LoopStartEnd(xyz,xRSSI,yRSSI,m,n)
    xyse = zeros(2,2);
    if 1 > xyz(1) - (xRSSI / 2)
        xyse(1,1) = 1; 
    else 
        xyse(1,1) = fix(xyz(1) - (xRSSI / 2));
    end
    if n < xyz(1) + (xRSSI / 2)
        xyse(1,2) = n;
    else
        xyse(1,2) = fix(xyz(1) + (xRSSI / 2));
    end
    
    if 1 > xyz(2) - (yRSSI / 2)
        xyse(2,1) = 1; 
    else 
        xyse(2,1) = fix(xyz(2) - (yRSSI / 2));
    end
    if m < xyz(2) + (yRSSI / 2)
        xyse(2,2) = m;
    else
        xyse(2,2) = fix(xyz(2) + (yRSSI / 2));
    end
end

function [WaveMap,MAPS,maps] = ElectromagneticWaveMap(PointThreshold,WaveMap,threshold,i,xyse,MAPS,maps,gioData)
    PriNum = 2^(i - 1);
    Wave = WaveMap(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2));
    Data = gioData(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2));
    MA = MAPS(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2),1);
    ma = maps(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2));
    chack = (PointThreshold >= threshold);
    Wave(chack) = Wave(chack) + PriNum;
    MA(chack) = MA(chack) + 0.25;
    ma(chack) = Data(chack);
    WaveMap(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2)) = Wave;
    MAPS(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2),1) = MA;
    maps(xyse(2,1):xyse(2,2),xyse(1,1):xyse(1,2)) = ma;
end

%************************************************************
% ���[�O���b�h�����̌v�Z
% 3������Ԃɂ�����2�_�ԋ����̌v�Z
%************************************************************
function d = getDistance3D(x1, y1, z1, x2, y2, z2)
    d = sqrt((x1-x2).^2 + (y1-y2).^2 + (z1-z2).^2);
end


function j = KnifeEdgeParameter(freq,d1,d2,h)
    v = h .* sqrt(2./freq  .* (1./d1 + 1./d2));
    j = 6.9 + 20 .* log(sqrt((v - 0.1).^2 + 1) + v + 0.1);
end

%**************************
% ���R��ԓ`���̗������v�Z
%**************************
function gain = calFreeSpaceGain(dist, freq)
    lambda = 300./freq;
    gain = 20.*log10(lambda ./ (4 .* pi .* dist));
end

%************************************************************
% ���ʏ��̓���
% xml�t�@�C���̋��ʏ��(���g���Ȃ�)��ǂݎ��
%************************************************************
function commonInfo = inputInfo(xml)
    %XML�t�@�C���̉���
    commentViewFlag = 0;
    if commentViewFlag == 1
        disp('***** INPUT COMMMON INFO *****');
    end
    
    %�\���̂̒�`
    commonInfo = struct('threshold', nan, 'frequency', nan, 'redundancy', nan, 'nodeNum', nan, 'heightMax', nan,'heightMin', nan);
    
    allInfo = xml.getElementsByTagName('common');   %'node'�^�O�̊K�w���X�g�擾
    
    thisInfo = allInfo.item(0);
    tempThre      = thisInfo.getElementsByTagName('threshold');
    tempFreq      = thisInfo.getElementsByTagName('frequency');
    tempRedu      = thisInfo.getElementsByTagName('redundancy');
    tempNodeNum   = thisInfo.getElementsByTagName('nodeNum');
    tempHeightMax = thisInfo.getElementsByTagName('heightMax');
    tempHeightMin = thisInfo.getElementsByTagName('heightMin');
    commonInfo.threshold    = str2double(tempThre.item(0).getTextContent);
    commonInfo.frequency    = str2double(tempFreq.item(0).getTextContent);
    commonInfo.redundancy   = str2double(tempRedu.item(0).getTextContent);
    commonInfo.nodeNum = str2double(tempNodeNum.item(0).getTextContent);
    commonInfo.heightMax = str2double(tempHeightMax.item(0).getTextContent);
    commonInfo.heightMin = str2double(tempHeightMin.item(0).getTextContent);
end

%************************************************************
% �o�͂���XML���쐬����
%************************************************************
function makeOutputXML(nodeList,commonInfo,name)
    disp('***** Output XML Info *****');
    nodeNum = numel(nodeList);  %�S�[����
    
    %XML�t�@�C���֏������݃v���O������
    docNode = com.mathworks.xml.XMLUtils.createDocument('data');    %���[�g�v�f�̒�`
    docRootNode = docNode.getDocumentElement;                       %���[�g�v�f�ɑΉ�����m�[�h���擾����
    %docRootNode.setAttribute('attr_name','attr_value');            %���[�g�v�f�̑������`����
    
    commonElement = docNode.createElement('common');                        %�q�m�[�h���`
    docRootNode.appendChild(commonElement);                 
    
    frequencyElement = docNode.createElement('threshold');
    frequencyElement.appendChild(docNode.createTextNode(sprintf('%d',commonInfo.threshold)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
    commonElement.appendChild(frequencyElement);   
    
    frequencyElement = docNode.createElement('frequency');
    frequencyElement.appendChild(docNode.createTextNode(sprintf('%d',commonInfo.frequency)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
    commonElement.appendChild(frequencyElement);   
    
    redundancyElement = docNode.createElement('redundancy');
    redundancyElement.appendChild(docNode.createTextNode(sprintf('%d',commonInfo.redundancy)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
    commonElement.appendChild(redundancyElement);   
    
    nodeNumElement = docNode.createElement('nodeNum');
    nodeNumElement.appendChild(docNode.createTextNode(sprintf('%d', nodeNum)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
    commonElement.appendChild(nodeNumElement);   
     

    for i=1:nodeNum
        nodeElement = docNode.createElement('node');                        %�q�m�[�h���`
        docRootNode.appendChild(nodeElement);                 

        noElement = docNode.createElement('no');                        %�q�m�[�h���`
        noElement.appendChild(docNode.createTextNode(sprintf('%d',i)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
        nodeElement.appendChild(noElement);
        
        typeElement = docNode.createElement('type');                        %�q�m�[�h���`
        typeElement.appendChild(docNode.createTextNode(nodeList(i).type));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
        nodeElement.appendChild(typeElement);   
        
        lonElement = docNode.createElement('lon');                        %�q�m�[�h���`
        lonElement.appendChild(docNode.createTextNode(sprintf('%f',nodeList(i).lon)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
        nodeElement.appendChild(lonElement);   
        
        latElement = docNode.createElement('lat');                        %�q�m�[�h���`
        latElement.appendChild(docNode.createTextNode(sprintf('%f',nodeList(i).lat)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
        nodeElement.appendChild(latElement);                 
        
        heightElement = docNode.createElement('height');                        %�q�m�[�h���`
        heightElement.appendChild(docNode.createTextNode(sprintf('%.2f',nodeList(i).height)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
        nodeElement.appendChild(heightElement);             
        
        connectedNum = length(nodeList(i).connected);
        connectedElement = docNode.createElement('connected');  %�q�m�[�h���`
        connectedElement.appendChild(docNode.createTextNode(sprintf('%d',nodeList(i).connected(1))));
        for j = 2:connectedNum
            connectedElement.appendChild(docNode.createTextNode(sprintf(',%d',nodeList(i).connected(j))));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
            nodeElement.appendChild(connectedElement);
        end
        nodeElement.appendChild(connectedElement);
        
        connectableElement = docNode.createElement('connectable');                        %�q�m�[�h���`
        connectableElement.appendChild(docNode.createTextNode(sprintf('%d',nodeList(i).connectable)));   %�e�q�֌W�̒�`�Ɠ��e�̋L�q
        nodeElement.appendChild(connectableElement);
        
    end
    
    docNode.appendChild(docNode.createComment('this is a comment'));        %�R�����g���L�q
    xmlwrite(name, docNode);         %xml�t�@�C���o��
    %type(xmlFileName);                      %�R�}���h�E�B���h�E�ɕ\��
end