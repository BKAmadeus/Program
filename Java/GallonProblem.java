import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;

class GallonState{

	GallonState preGallonState;    // １つ前の状態   // 前の移動
	int count;
	int gallon4, gallon3, nextg4, nextg3;
	static int maxNumber = 5*4-1;    //hashCode()の最大値+1

	public GallonState(GallonState preGallonState, int count, int gallon4, int gallon3) {
		this.preGallonState = preGallonState;
		this.count = count;
		this.gallon4 = gallon4;
	this.gallon3 = gallon3;
	}

	//各移動方法と、それに対応するメッセージ
	static String moveMessage[] = new String[]{
		"4ガロンの水差しに水を入れて満杯にする",
		"3ガロンの水差しに水を入れて満杯にする",
		"4ガロンの水差しの水を捨てる",
		"3ガロンの水差しの水を捨てる",
		"4ガロンの水差しの水を3ガロンの水差しに移して3ガロンの水差しを満杯にする",
		"3ガロンの水差しの水を4ガロンの水差しに移して4ガロンの水差しを満杯にする",
		"4ガロンの水差しの水をすべて3ガロンの水差しに移す",
		"3ガロンの水差しの水をすべて4ガロンの水差しに移す"
	};

    //この状態から存在する移動方法と、移動後の状態を列挙する。
	public LinkedList<GallonState> nextMove(){
		LinkedList<GallonState> ret = new LinkedList<GallonState>();

		for (int i=0; i<=7; i++) {
			switch(i){
				case 0:
					nextg4=4;
					nextg3=gallon3;
					break;
				case 1:
					nextg4=gallon4;
					nextg3=3;
					break;
				case 2:
					nextg4=0;
					nextg3=gallon3;
					break;
				case 3:
					nextg4=gallon4;
					nextg3=0;
					break;
				case 4:
					nextg4=gallon4-(3-gallon3);
					nextg3=3;
					break;
				case 5:
					nextg4=4;
					nextg3=gallon3-(4-gallon4);
					break;
				case 6:
					nextg4=0;
					nextg3=gallon3+gallon4;
					break;
				case 7:
					nextg4=gallon3+gallon4;
					nextg3=0;
					break;
				default:
			}
			GallonState nextGallonState = new GallonState(this, i, nextg4, nextg3);
			if(nextGallonState.isValid()){
				ret.add(nextGallonState);
			}
		}
		return ret;
	}

	//目的の状態に辿りつけたかどうかを判定する
	public boolean isGoal(){
		return (hashCode() == 8);
	}

	//有効な配置となっているかを検証する
	public boolean isValid(){
		//有り得ない移動をした場合の処理
		if(gallon4 < 0 || gallon4 > 4){
			return false;
		}
		if(gallon3 < 0 || gallon3 > 3){
			return false;
		}
		return true;
	}

	//0～maxNumber-1までのナンバリングを行う
	public int hashCode(){
		return gallon4*4+gallon3;
	}
}

public class GallonProblem {

	public static void main(String[] args) {
		boolean[] isChecked = new boolean[5*4];
		Queue<GallonState> queue = new LinkedList<GallonState>();
		GallonState firstGallonState = new GallonState(null, 0, 0, 0);
		queue.add(firstGallonState);
		isChecked[firstGallonState.hashCode()] = true;
		GallonState goal = null;
		while(!queue.isEmpty()){
			GallonState now = queue.poll();
			//nowに関する処理。今回は目的の状態に達しているか判定するだけ
			if(now.isGoal()){
				goal = now;
				break;
			}
			//次の状態遷移の列挙
			for(GallonState next: now.nextMove()){
				if(isChecked[next.hashCode()]){
					continue;
				}
				isChecked[next.hashCode()] = true;
				queue.add(next);
			}
		}
		if( goal != null ){
			//答えを見つけた場合、答えから逆順に辿っていき、解を生成する。
			//逆順にするため使いやすいStackを利用しているが、Listや配列等なんでも良い
			Stack<String> res = new Stack<String>();
			while( goal.count != 0 ){
				res.add(GallonState.moveMessage[goal.count]);
				goal = goal.preGallonState;
			}
			while(!res.isEmpty()) System.out.println(res.pop());
		}
		else{
			//答えが存在しない場合は、no resultと返す
			System.out.println("no result");
		}
	}
}