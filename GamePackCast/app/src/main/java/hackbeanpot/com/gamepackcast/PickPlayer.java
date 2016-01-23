package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class PickPlayer extends MainActivity {
    private static final String TAG = PickPlayer.class.getSimpleName();
    private GoogleApiClient mApiClient;
    private HelloWorldChannel mHelloWorldChannel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.player_drink);

        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);

        Button playerOneButton = (Button) findViewById(R.id.player1);
        Button playerTwoButton = (Button) findViewById(R.id.player2);
        Button playerThreeButton = (Button) findViewById(R.id.player3);
        Button playerFourButton = (Button) findViewById(R.id.player4);
        //TODO dynamically chance text of buttons to player names
        playerOneButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_PLAYER:1");
            }
        });
        playerTwoButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_PLAYER:2");
            }
        });
        playerThreeButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_PLAYER:3");
            }
        });
        playerFourButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_PLAYER:4");
            }
        });
    }
}
