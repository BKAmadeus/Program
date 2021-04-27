function test()
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
    minh = commonInfo.heightMin;
    maxh = commonInfo.heightMax;
    gioData = dlmread('Practice\map.csv');
    gioMeta = dlmread('Practice\meta.csv');
    latlon = dlmread('Practice\latlon.csv');
    fclose('all');
    [m,n] = size(gioData);
    [xpixel,ypixel,lat,lon] = PixelLatLon(m,n,latlon);
    [xRSSI,yRSSI] = FreeRSSICreat(threshold,frequency,xpixel,ypixel);
    scrsz = get(groot,'ScreenSize');
    figure('Position', scrsz);
    set(gca,'YDir','reverse');
    WaveMap = int64(zeros(m,n));
    MAPS(:,:,1) = zeros(m,n);
    MAPS(:,:,2) = zeros(m,n);
    MAPS(:,:,3) = zeros(m,n);
    xyz = [377.0000  158.0000  225.1100];
    height = MAPS(:,:,1)+maxh;
    height(xyz(2),xyz(1)) = 1.1;
    %height = HeightMatrixCreat(MAPS(:,:,1),xyz,nodeList,maxh);
    maps = NaN(m,n);
    %地点ごとのRSSI閾値を求め配列を返す
    xyse = LoopStartEnd(xyz,xRSSI,yRSSI,m,n);
    PointThreshold = ElectromagneticWaveThreshold(xpixel,ypixel,threshold,frequency,gioData,xyz(1),xyz(2),xyz(3),xyse,height,gioMeta);
    [WaveMap,MAPS,maps] = ElectromagneticWaveMap(PointThreshold,WaveMap,1,xyse,MAPS,maps,gioData);
    hold on    % 座標軸の固定
    [m,n] = size(gioData);
    [X,Y] = meshgrid(1:n,1:m);
    contour3(X*xpixel,Y*ypixel,gioData,70);
    MAPS(:,:,2) = 1 - MAPS(:,:,2);
    MAPS(:,:,3) = MAPS(:,:,2);
    s = surf(X*xpixel,Y*ypixel,maps,MAPS,'LineStyle' ,'none');
    alpha(s,.5);
    hold off
    %DrawPoint(gioData, nodeList,xyz,xpixel,ypixel,maps,MAPS);
    toc
end

function h = NewNodeHeight(xpixel,ypixel,WaveMap,nodeList,ConnectMini,gioData,xyz,minh,maxh,interval,frequency,threshold,AddPoint,gioMeta)
    n = WaveMap(AddPoint(2),AddPoint(1));
    n = dec2bin(n,numel(nodeList));
    A = abs(find(n == int2str(1)) - numel(nodeList)) + 1;
    h = minh;
    if numel(A) ~= 1
        for i = maxh:-interval:minh
            for j = 1:length(A)
                MaxElevation = StraightPosition(xpixel,ypixel,frequency,xyz(A(j),1),xyz(A(j),2),xyz(A(j),3),AddPoint(1),AddPoint(2),gioData,i,gioMeta);
                Threshold = ThresholdGain(xpixel,ypixel,threshold,frequency,xyz(A(j),1),xyz(A(j),2),xyz(A(j),3),AddPoint(1),AddPoint(2),gioData(AddPoint(2),AddPoint(1))+i,MaxElevation);
                if Threshold == 0
                    h = i + interval;
                    break;
                end
            end
            if h > minh
                break;
            end
        end
    else
        B = find(ConnectMini ~= 1);
        C = find(ConnectMini == B(1));
        max = -10000;
        for i = maxh:-interval:minh
            for j = 1:length(C)
                MaxElevation = StraightPosition(xpixel,ypixel,frequency,xyz(C(j),1),xyz(C(j),2),xyz(C(j),3),AddPoint(1),AddPoint(2),gioData,i,gioMeta);
                Threshold = ThresholdGain(xpixel,ypixel,max,frequency,xyz(C(j),1),xyz(C(j),2),xyz(C(j),3),AddPoint(1),AddPoint(2),gioData(AddPoint(2),AddPoint(1))+i,MaxElevation);
                if Threshold ~= 0
                    h = i;
                end
            end
        end
    end
end

function height = HeightMatrixCreat(height,xyz,nodeList,Max)
    height(height == 0) = Max;
    for i = 1:numel(nodeList)
        height(xyz(i,2),xyz(i,1)) = nodeList(i).height;
    end
end

function [xpixel,ypixel,lat,lon] = PixelLatLon(col,raw,latlon)
    lat = latlon(1,1:col);
    lon = latlon(2,1:raw);
    xpixel = latlon(3,1);
    ypixel = latlon(3,2);
end


function AddPoint = FarDeploy(xpixel,ypixel,MAPS,gioData,WaveMap,ConnectMini,nodeList,height,frequency,xyz,gioMeta)
    AddPoint = [0 0 0];
    [m,n] = size(gioData);
    MAP = zeros(m,n);
    dMax = -10000;
    Wave = dec2bin(WaveMap);
    A = find(ConnectMini ~= 1);
    nMax = numel(nodeList);
    B = find(ConnectMini == A(1));
    for k = B
        A = find(Wave(:,nMax - (k-1)) == int2str(1));
        for i = A
            MAP(i) = MAP(i) + 0.25;
        end
    end
    MAPS(:,:,2) = MAPS(:,:,2) - MAP;
    [erow,ecol] = find(MAPS(:,:,2) ~= 0);
    Le = length(erow);
    for j = 1:Le
        for i = 1:length(B)
            x = xyz(B(i),1);
            y = xyz(B(i),2);
            z = xyz(B(i),3);
            x0 = ecol(j);
            y0 = erow(j);
            MaxElevation = StraightPosition(xpixel,ypixel,frequency,x,y,z,x0,y0,gioData,height(y0,x0),gioMeta);
            f = ThresholdGain(xpixel,ypixel,dMax,frequency,x,y,z,x0,y0,gioData(y0,x0)+height(y0,x0),MaxElevation);
            %ThresholdGain(xpixel,ypixel,threshold,frequency,x,y,z,x1,y1,z1,MaxElevation)
            if f ~= 0
                dMax = f;
                AddPoint = [x0 y0 gioData(y0,x0)];
            end
        end
    end
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
%ノードを追加する処理
%ノード位置とxyz変数、nodeListをを更新する
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
%追加ノード設置位置を決める関数
%繋がっている点を省き数で調整し最も高い点を取る
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function [Point,MtMax] = OverLap(xpixel,ypixel,Matrix,nodeList,Aggregation,WaveMap,ConnectMini,height,frequency,xyz,gioMeta)
    Point = [0 0 0];
    [m,n] = size(Matrix);
    nMax = numel(nodeList);
    Wave = dec2bin(WaveMap);
    Max = -1000;
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
    if MtMax ~= 0.25
        for y = 1:m
            for x = 1:n
                if MtMax == Aggregation(y,x)
                    A = nMax - (find(Wave(m * (x - 1) + y,:) == int2str(1)) - 1);
                    Con = ConnectMini;
                    for i = 1:length(A)
                        Con(Con == ConnectMini(A(i))) = 0;
                    end
                    D = find(Con ~= 0);
                    Df = find (Con == 0);
                    if isempty(D)
                        D = A;
                    end
                    for i = 1:length(D)
                        for j = 1:length(Df)
                            MaxElevation = StraightPosition(xpixel,ypixel,frequency,xyz(i,1),xyz(i,2),xyz(i,3),xyz(j,1),xyz(j,2),Matrix,height(xyz(j,2),xyz(j,1)),gioMeta);
                            f = ThresholdGain(xpixel,ypixel,Max,frequency,x,y,Matrix(y,x)+height(y,x),xyz(i,1),xyz(i,2),xyz(i,3),MaxElevation);
                            if f > Max
                                fMax = f;
                            end
                        end
                        MaxElevation = StraightPosition(xpixel,ypixel,frequency,xyz(i,1),xyz(i,2),xyz(i,3),x,y,Matrix,height(y,x),gioMeta);
                        f = ThresholdGain(xpixel,ypixel,Max,frequency,x,y,Matrix(y,x)+height(y,x),xyz(i,1),xyz(i,2),xyz(i,3),MaxElevation);
                        dif = f - fMax;
                        if dif > diffMax
                            Point(1) = x;
                            Point(2) = y;
                            Point(3) = Matrix(y,x);
                            diffMax = dif;
                        end
                    end
                end
            end
        end
    end
    %disp(WaveMap(Point(2),Point(1)));
    %disp(AllPoint(count,:));
end

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%グラフに繋がりのあるノード同紙に線を引く
%nodeList.connected更新
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
    % dは距離[m]でメッシュがm間隔であり、１ノードごとの直径が欲しいため2倍する
    xRSSI = fix(d/xpixel*2); 
    yRSSI = fix(d/ypixel*2);
end
%************************************************************
% ノード情報の入力
% xmlファイルのノードに関する情報を読み取る
%************************************************************
function nodeList = inputNodes(xml)
    %XMLファイルの可視化
    commentViewFlag = 0;
    if commentViewFlag == 1
        disp('***** INPUT XML FILE *****');
    end
    
    %構造体の定義
    nodeList = struct('no', nan, 'type', nan, 'x', nan, 'y', nan, 'height', nan, 'connected', nan, 'connectable', nan);
    
    allNodes = xml.getElementsByTagName('node');   %'node'タグの階層リスト取得
    nodeNum = allNodes.getLength;   %ノード数
    
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
    nodeNum = numel(nodeList);  %全ノード数
    hold on    % 座標軸の固定
    [m,n] = size(gioData);
    [X,Y] = meshgrid(1:n,1:m);
    contour3(X*xpixel,Y*ypixel,gioData,70);
    MAPS(:,:,2) = 1 - MAPS(:,:,2);
    MAPS(:,:,3) = MAPS(:,:,2);
    s = surf(X*xpixel,Y*ypixel,maps,MAPS,'LineStyle' ,'none');
    alpha(s,.5);
    % ノードの描画
    for i = 1:nodeNum
        % 端末がエンドデバイス
        if (strcmp(nodeList(i).type, 'ed'))
            scatter3(xyz(i,1)*xpixel, xyz(i,2)*ypixel, xyz(i,3)+10, 300,'white','filled','o','LineWidth',2,'MarkerEdgeColor','k');
        % 端末がエンドデバイス
        elseif (strcmp(nodeList(i).type, 'rt'))
            scatter3(xyz(i,1)*xpixel, xyz(i,2)*ypixel, xyz(i,3)+10, 300 ,'white','filled','^','LineWidth',2,'MarkerEdgeColor','k'); %[R,G,B]
        % 端末がエンドデバイス
        elseif (strcmp(nodeList(i).type, 'cd'))
            scatter3(xyz(i,1)*xpixel, xyz(i,2)*ypixel, xyz(i,3)+10, 300,'white','filled','o','LineWidth',2,'MarkerEdgeColor','k');
        end
        % 端末情報の描画
         text(xyz(i,1)*xpixel+10, xyz(i,2)*ypixel , xyz(i,3) + 30, num2str(nodeList(i).no) ,'Color','white','FontSize',15);
    end

    hold off   %座標軸の開放
    title('ネットワーク');
end
%{
function DrawPoint(gioData, nodeList,xyz)
    nodeNum = numel(nodeList);  %全ノード数
    hold on    % 座標軸の固定
    %mesh(gioData); % meshc:等高線のある3Dグラフ表示
    colorbar;
    contour3(gioData,100);
    caxis([0 5000]);
    
    % ノードの描画
    for i = 1:nodeNum
        % 端末がエンドデバイス
        if (strcmp(nodeList(i).type, 'ed'))
            scatter3(xyz(i,1), xyz(i,2), xyz(i,3)+10, 75,'white','filled','o','LineWidth',3,'MarkerEdgeColor','k');
        % 端末がエンドデバイス
        elseif (strcmp(nodeList(i).type, 'rt'))
            scatter3(xyz(i,1), xyz(i,2), xyz(i,3)+10, 75 ,'white','filled','^','LineWidth',2,'MarkerEdgeColor','k'); %[R,G,B]
        % 端末がエンドデバイス
        elseif (strcmp(nodeList(i).type, 'cd'))
            scatter3(xyz(i,1), xyz(i,2), xyz(i,3)+10, 150,'white','filled','p','LineWidth',2,'MarkerEdgeColor','k');
        end
        % 端末情報の描画
         text(xyz(i,1) + 1, xyz(i,2) + 1, xyz(i,3) + 30, num2str(nodeList(i).no) ,'Color','black','FontSize',32);
    end

    hold off   %座標軸の開放
    title('ネットワーク');
end
%}
function PointThreshold = ElectromagneticWaveThreshold(xpixel,ypixel,threshold,frequency,gioData,x,y,z,xyse,height,gioMeta)
    [m,n] = size(gioData);
    PointThreshold = zeros(m,n);
    for i = xyse(1,1) : xyse(1,2)
        for j = xyse(2,1) : xyse(2,2)
            MaxElevation = StraightPosition(xpixel,ypixel,frequency,x,y,z,i,j,gioData,height(j,i),gioMeta);
            PointThreshold(j,i) = ThresholdGain(xpixel,ypixel,threshold,frequency,x,y,z,i,j,gioData(j,i)+height(j,i),MaxElevation);
        end
    end
end

function Threshold = ThresholdGain(xpixel,ypixel,threshold,frequency,x,y,z,x1,y1,z1,MaxElevation)
    Threshold = 0;
    %LoS環境
    if MaxElevation(4) <= 0 %&& MaxElevation(5) <= 0
        d = getDistance3D(x*xpixel,y*ypixel,z,x1*xpixel, y1*ypixel, z1);
        f = calFreeSpaceGain(d, frequency);
    %NLoS環境
    elseif MaxElevation(4) > 0
        d = getDistance3D(x*xpixel, y*ypixel, z, x1*xpixel, y1*ypixel, z1);
        d1 = getDistance3D(MaxElevation(1)*xpixel, MaxElevation(2)*ypixel, MaxElevation(3), x1*xpixel, y1*ypixel, z1);
        d2 = getDistance3D(MaxElevation(1)*xpixel, MaxElevation(2)*ypixel, MaxElevation(3), x*xpixel, y*ypixel, z);
        h = MaxElevation(4);
        v = KnifeEdgeParameter(frequency,d1,d2,h);
        f = calFreeSpaceGain(d, frequency);
        f = f - v;
        %
    %フレネルゾーン浸食のみ
    elseif MaxElevation(5) > 0 && MaxElevation(4) <= 0
        d = getDistance3D(x*xpixel,y*ypixel,z,x1*xpixel, y1*ypixel, z1);
        f = calFreeSpaceGain(d, frequency);
        f = f - (2*MaxElevation(5));
        %
    end
    %森林浸食
    %
    if MaxElevation(6) <= 0
        f = f - 0.8*MaxElevation(6);
    end
    %
    if f > threshold
        Threshold = f;
    end
end

function MaxElevation = StraightPosition(xpixel,ypixel,frequency,TyuX,TyuY,TyuZ,X,Y,gioData,h,gioMeta)
    %map(y,x) maxelevation(x y z z0) 
    MaxElevation =  [TyuX TyuY TyuZ 0 0 0];
    Tilt = (TyuY - Y)/(TyuX - X);
    Section = ((TyuY - Y)/(TyuX - X)) * -X + Y;
    d = getDistance3D(TyuX*xpixel,TyuY*ypixel,TyuZ,X*xpixel,Y*ypixel,gioData(Y,X) + h);
    FreR = sqrt(300/frequency*d)/2;
    if X == TyuX  || abs(Tilt) > 1
        if Y <= TyuY
            maxY = TyuY;
            minY = Y;
            maxZ = TyuZ;
            minZ = gioData(Y,X) + h;
        else
            maxY = Y;
            minY = TyuY;
            maxZ = gioData(Y,X) + h;
            minZ = TyuZ;
        end
        StandardTiltZ = (maxZ - minZ)/(maxY - minY);
        StandardSectionZ = StandardTiltZ * -minY + minZ;
        sita = 180 / (maxY - minY);
        for i = minY : maxY
            if X == TyuX
                x = TyuX;
            elseif abs(Tilt) > 1
                x = round((i - Section)/Tilt);
            end
            y = i;
            Sin = deg2rad((i-minY) * sita);
            Fr = sin(Sin) * FreR;
            z = gioData(y,x);
            TiltZ = i * StandardTiltZ + StandardSectionZ;
            Forest = (z + 3)*(gioMeta(y,x) == 1000);
            if MaxElevation(4) < z - TiltZ
                MaxElevation(1) = x;
                MaxElevation(2) = y;
                MaxElevation(3) = z;
                MaxElevation(4) = z - TiltZ;
            end
            if MaxElevation(5) < (z - (TiltZ - Fr))/Fr
                MaxElevation(5) = (z - (TiltZ - Fr))/Fr;
            end
            if 0 < Forest - TiltZ
                MaxElevation(6) = MaxElevation(6) + 5;
            end
        end
    elseif Y == TyuY || abs(Tilt) < 1
        if X <= TyuX
            maxX = TyuX ;
            minX = X;
            maxZ = TyuZ;
            minZ = gioData(Y,X) + h;
        else
            maxX = X;
            minX = TyuX;
            maxZ = gioData(Y,X) + h;
            minZ = TyuZ;
        end
        
        StandardTiltZ = (maxZ- minZ)/(maxX - minX);
        StandardSectionZ = StandardTiltZ * -minX + minZ;
        sita = 180 / (maxX - minX);
        for i = minX : maxX
            x = i;
            y = round(i*Tilt + Section);
            z = gioData(y,x);
            TiltZ = i * StandardTiltZ + StandardSectionZ;
            Sin = deg2rad((i - minX) * sita);
            Fr = sin(Sin) * FreR;
            Forest = (z + 3)*(gioMeta(y,x) == 1000);
            if MaxElevation(4) < z - TiltZ
                MaxElevation(1) = x;
                MaxElevation(2) = y;
                MaxElevation(3) = z;
                MaxElevation(4) = z - TiltZ;
            end
            if MaxElevation(5) < (z - (TiltZ - Fr))/Fr
                MaxElevation(5) = (z - (TiltZ - Fr))/Fr;
            end
            if 0 < Forest - TiltZ
                MaxElevation(6) = MaxElevation(6) + 5;
            end
        end
    end
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

function [WaveMap,MAPS,maps] = ElectromagneticWaveMap(PointThreshold,WaveMap,i,xyse,MAPS,maps,gioData)
    PriNum = 2^(i - 1);
    for j = xyse(1,1):xyse(1,2)
        for k = xyse(2,1):xyse(2,2)
            if PointThreshold(k,j) ~= 0
                WaveMap(k,j) = WaveMap(k,j) + PriNum;
                MAPS(k,j,2) = MAPS(k,j,2) + 0.25;
                maps(k,j) = gioData(k,j);
            end
        end
    end
end

%************************************************************
% ユーグリッド距離の計算
% 3次元空間における2点間距離の計算
%************************************************************
function d = getDistance3D(x1, y1, z1, x2, y2, z2)
    d = sqrt((x1-x2)^2 + (y1-y2)^2 + (z1-z2)^2);
end


function j = KnifeEdgeParameter(freq,d1,d2,h)
    v = h * sqrt(2/freq  * (1/d1 + 1/d2));
    j = 6.9 + 20 * log(sqrt((v - 0.1)^2 + 1) + v + 0.1);
end

%**************************
% 自由空間伝搬の利得を計算
%**************************
function gain = calFreeSpaceGain(dist, freq)
    lambda = 300/freq;
    gain = 20*log10(lambda / (4 * pi * dist));
end

%************************************************************
% 共通情報の入力
% xmlファイルの共通情報(周波数など)を読み取る
%************************************************************
function commonInfo = inputInfo(xml)
    %XMLファイルの可視化
    commentViewFlag = 0;
    if commentViewFlag == 1
        disp('***** INPUT COMMMON INFO *****');
    end
    
    %構造体の定義
    commonInfo = struct('threshold', nan, 'frequency', nan, 'redundancy', nan, 'nodeNum', nan, 'heightMax', nan,'heightMin', nan);
    
    allInfo = xml.getElementsByTagName('common');   %'node'タグの階層リスト取得
    
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
% 出力するXMLを作成する
%************************************************************
function makeOutputXML(nodeList,commonInfo,name)
    disp('***** Output XML Info *****');
    nodeNum = numel(nodeList);  %全端末数
    
    %XMLファイルへ書き込みプログラム例
    docNode = com.mathworks.xml.XMLUtils.createDocument('data');    %ルート要素の定義
    docRootNode = docNode.getDocumentElement;                       %ルート要素に対応するノードを取得する
    %docRootNode.setAttribute('attr_name','attr_value');            %ルート要素の属性を定義する
    
    commonElement = docNode.createElement('common');                        %子ノードを定義
    docRootNode.appendChild(commonElement);                 
    
    frequencyElement = docNode.createElement('threshold');
    frequencyElement.appendChild(docNode.createTextNode(sprintf('%d',commonInfo.threshold)));   %親子関係の定義と内容の記述
    commonElement.appendChild(frequencyElement);   
    
    frequencyElement = docNode.createElement('frequency');
    frequencyElement.appendChild(docNode.createTextNode(sprintf('%d',commonInfo.frequency)));   %親子関係の定義と内容の記述
    commonElement.appendChild(frequencyElement);   
    
    redundancyElement = docNode.createElement('redundancy');
    redundancyElement.appendChild(docNode.createTextNode(sprintf('%d',commonInfo.redundancy)));   %親子関係の定義と内容の記述
    commonElement.appendChild(redundancyElement);   
    
    nodeNumElement = docNode.createElement('nodeNum');
    nodeNumElement.appendChild(docNode.createTextNode(sprintf('%d', nodeNum)));   %親子関係の定義と内容の記述
    commonElement.appendChild(nodeNumElement);   
     

    for i=1:nodeNum
        nodeElement = docNode.createElement('node');                        %子ノードを定義
        docRootNode.appendChild(nodeElement);                 

        noElement = docNode.createElement('no');                        %子ノードを定義
        noElement.appendChild(docNode.createTextNode(sprintf('%d',i)));   %親子関係の定義と内容の記述
        nodeElement.appendChild(noElement);
        
        typeElement = docNode.createElement('type');                        %子ノードを定義
        typeElement.appendChild(docNode.createTextNode(nodeList(i).type));   %親子関係の定義と内容の記述
        nodeElement.appendChild(typeElement);   
        
        lonElement = docNode.createElement('lon');                        %子ノードを定義
        lonElement.appendChild(docNode.createTextNode(sprintf('%f',nodeList(i).lon)));   %親子関係の定義と内容の記述
        nodeElement.appendChild(lonElement);   
        
        latElement = docNode.createElement('lat');                        %子ノードを定義
        latElement.appendChild(docNode.createTextNode(sprintf('%f',nodeList(i).lat)));   %親子関係の定義と内容の記述
        nodeElement.appendChild(latElement);                 
        
        heightElement = docNode.createElement('height');                        %子ノードを定義
        heightElement.appendChild(docNode.createTextNode(sprintf('%.2f',nodeList(i).height)));   %親子関係の定義と内容の記述
        nodeElement.appendChild(heightElement);             
        
        connectedNum = length(nodeList(i).connected);
        connectedElement = docNode.createElement('connected');  %子ノードを定義
        connectedElement.appendChild(docNode.createTextNode(sprintf('%d',nodeList(i).connected(1))));
        for j = 2:connectedNum
            connectedElement.appendChild(docNode.createTextNode(sprintf(',%d',nodeList(i).connected(j))));   %親子関係の定義と内容の記述
            nodeElement.appendChild(connectedElement);
        end
        nodeElement.appendChild(connectedElement);
        
        connectableElement = docNode.createElement('connectable');                        %子ノードを定義
        connectableElement.appendChild(docNode.createTextNode(sprintf('%d',nodeList(i).connectable)));   %親子関係の定義と内容の記述
        nodeElement.appendChild(connectableElement);
        
    end
    
    docNode.appendChild(docNode.createComment('this is a comment'));        %コメントを記述
    xmlwrite(name, docNode);         %xmlファイル出力
    %type(xmlFileName);                      %コマンドウィンドウに表示
end
