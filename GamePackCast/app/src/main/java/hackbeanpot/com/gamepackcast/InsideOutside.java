package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class InsideOutside extends MainActivity {
    private static final String TAG = InsideOutside.class.getSimpleName();
    private GoogleApiClient mApiClient;
    private HelloWorldChannel mHelloWorldChannel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.inside_outside);

        Log.i(TAG, "test");
        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);

        Button insideButton = (Button) findViewById(R.id.inside);
        Button outsideButton = (Button) findViewById(R.id.outside);
        insideButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("INSIDE_OR_OUTSIDE:INSIDE");
            }
        });
        outsideButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("INSIDE_OR_OUTSIDE:OUTSIDE");
            }
        });
    }
}
