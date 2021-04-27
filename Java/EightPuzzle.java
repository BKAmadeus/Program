import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

class State8Puzzle{
	public State8Puzzle preState;  // 一つ前の状態

	int preMove;  // 一つ前のパネルの移動
	//0:左 1:上 2:右 3:下 空欄部分を動かす方向と逆になる
	static int[] vy = new int[]{0,1,0,-1};
	static int[] vx = new int[]{1,0,-1,0};
	public static String[] vName =
		new String[]{"left", "up", "right", "down"};

	int[][] nums;     //パズルの状態
	int zeroY,zeroX;  //空欄の存在する位置
	int hash;         //状態に対応付ける数値（初期値は-1）

	//移動可能な状態をLinkedListオブジェクトに入れて返す
	public LinkedList<State8Puzzle> nextMove(){
	LinkedList<State8Puzzle> ret = new LinkedList<State8Puzzle>();
		//空欄の動かし方は上下左右の4通り
		for(int i=0;i<4;i++){
			int nextZeroY = zeroY + vy[i];
			int nextZeroX = zeroX + vx[i];
			if(nextZeroX < 0 || nextZeroX >= 3)
				continue;
			if(nextZeroY < 0 || nextZeroY >= 3)
				continue;
			int[][] nextNums = new int[3][3];
			for (int y = 0; y < 3; y++) {
				for (int x = 0; x < 3; x++) {
					nextNums[y][x] = nums[y][x];
				}
			}
			nextNums[nextZeroY][nextZeroX] = 0;
			nextNums[zeroY][zeroX] = nums[nextZeroY][nextZeroX];
			ret.add(new State8Puzzle(this,i,nextNums,nextZeroY,nextZeroX));
		}
		return ret;
	}

	//コンストラクタ
	public State8Puzzle(
			State8Puzzle _preState, int _preMove, int[][] _nums,
			int _zeroY, int _zeroX){
		preState = _preState;
		preMove = _preMove;
		nums = _nums;
		zeroY = _zeroY;
		zeroX = _zeroX;
		hash = -1;
	}

	//パズルの状態を一意に数値に対応付ける
	public int hashCode(){
		if(hash!= -1)
			return hash;
		hash = 0;
		for (int y = 0; y < 3; y++) {
			for (int x = 0; x < 3; x++) {
				hash *= 10;
				hash += nums[y][x];
			}
		}
		return hash;
	}
}


public class EightPuzzle {
	public static void main(String[] args) throws IOException {
		//これから訪問する状態を入れておくキュー
		Queue<State8Puzzle> queue = new LinkedList<State8Puzzle>();
		//既に訪問済みの状態を入れておくセット
		Set<Integer> set = new HashSet<Integer>();

		//初期状態をキーボードから入力する
		BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

		int[][] firstNums = new int[3][3];
		int firstZeroX = -1,firstZeroY = -1;
		for (int y = 0; y < 3; y++) {
			for (int x = 0; x < 3; x++) {
				firstNums[y][x] = Integer.parseInt(br.readLine());
				if(firstNums[y][x]==0){
					firstZeroY = y;
					firstZeroX = x;
				}
			}
		}

		//初期状態オブジェクトを生成してセットとキューに入れる
		State8Puzzle firstState =
				new State8Puzzle(null,-1,firstNums,firstZeroY,firstZeroX);
		set.add(firstState.hashCode());
		queue.add(firstState);
		while(!queue.isEmpty()){
			//キューの先頭データを取り出して状態nowStateに代入
			State8Puzzle nowState = queue.poll();

			//nowStateがゴールの状態なら移動順を列挙する
			//逆からたどっているのでひっくり返して出力
			if(nowState.hashCode()==123456780){
				LinkedList<String> moves = new LinkedList<String>();
				while(nowState.preMove!=-1){
					moves.addFirst(State8Puzzle.vName[nowState.preMove]);
					nowState = nowState.preState;
				}
				for(String move : moves){
					System.out.println("move " + move);
				}
				System.out.println("done");
				return;
			}

			//nowStateから移動できる状態がまだ調べてなければ
			//セットとキューに追加する
			for(State8Puzzle nextState : nowState.nextMove()){
				if(!set.contains(nextState.hashCode())){
					set.add(nextState.hashCode());
					queue.add(nextState);
				}
			}
		}
		//解が存在しなかったときの処理
		System.out.println("no answer");
		return;
	}
}
