package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class HighLow extends MainActivity {
    private static final String TAG = HighLow.class.getSimpleName();
    private GoogleApiClient mApiClient;
    private HelloWorldChannel mHelloWorldChannel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.high_low);

        Log.i(TAG, "test");
        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);

        Button higherButton = (Button) findViewById(R.id.higher);
        Button lowerButton = (Button) findViewById(R.id.lower);
        higherButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("HIGHER_OR_LOWER:HIGHER");
            }
        });
        lowerButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("HIGHER_OR_LOWER:LOWER");
            }
        });
    }
}
