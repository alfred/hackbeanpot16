package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.util.Log;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class Waiting extends MainActivity {
    private static final String TAG = NumPlayers.class.getSimpleName();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.waiting);
        Log.i(TAG, "waiting screen");
    }
}
