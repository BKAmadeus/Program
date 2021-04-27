fig = openfig("untitled_2.4G.fig");
t=360;
delaytime = 0.16;
F(t) = struct('cdata',[],'colormap',[]);
axis tight 
set(gca,'nextplot','replacechildren'); 
for i = 1:20:t
    view(i,30);
    F(i) = getframe(fig);
    [X,map] = rgb2ind(F(i).cdata,256);
    if i==1
        % GIFファイルに書き出し
        imwrite(X,map,'result_image.gif','gif', 'Loopcount',inf,'DelayTime',delaytime);
    else
        % 2回目以降は'append'でアニメーションを作成
        imwrite(X,map,'result_image.gif','WriteMode','append','DelayTime',delaytime);
    end
end
%v = VideoWriter('test','MPEG-4');
%close(v);
%open(v);
%writeVideo(v,F);
%close(v);