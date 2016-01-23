package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class PickCard extends MainActivity {
    private static final String TAG = NumPlayers.class.getSimpleName();
    private GoogleApiClient mApiClient;
    private HelloWorldChannel mHelloWorldChannel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pick_card);

        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);

        Button cardOneButton = (Button) findViewById(R.id.card1);
        Button cardTwoButton = (Button) findViewById(R.id.card2);
        Button cardThreeButton = (Button) findViewById(R.id.card3);
        Button cardFourButton = (Button) findViewById(R.id.card4);

        cardOneButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_CARD:1");
            }
        });
        cardTwoButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_CARD:2");
            }
        });
        cardThreeButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_CARD:3");
            }
        });
        cardFourButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("PICK_CARD:4");
            }
        });
    }
}
