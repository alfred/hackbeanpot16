package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class NumPlayers extends MainActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.enter_name);

        Button onePlayerButton = (Button) findViewById(R.id.oneplayer);
        Button twoPlayerButton = (Button) findViewById(R.id.twoplayers);
        Button threePlayerButton = (Button) findViewById(R.id.threeplayers);
        Button fourPlayerButton = (Button) findViewById(R.id.fourplayers);

        onePlayerButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("NUM_PLAYERS:1");
            }
        });
        twoPlayerButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("NUM_PLAYERS:2");
            }
        });
        threePlayerButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("NUM_PLAYERS:3");
            }
        });
        fourPlayerButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("NUM_PLAYERS:4");
            }
        });
    }
}
