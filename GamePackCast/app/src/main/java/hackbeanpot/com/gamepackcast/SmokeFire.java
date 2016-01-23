package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.test.suitebuilder.annotation.Smoke;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class SmokeFire extends MainActivity {
    private static final String TAG = SmokeFire.class.getSimpleName();
    private GoogleApiClient mApiClient;
    private HelloWorldChannel mHelloWorldChannel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.smoke_fire);

        Log.i(TAG, "test");
        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);

        Button smokeButton = (Button) findViewById(R.id.smoke);
        Button fireButton = (Button) findViewById(R.id.fire);
        smokeButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("SMOKE_OR_FIRE:SMOKE");
            }
        });
        fireButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                sendMessage("SMOKE_OR_FIRE:FIRE");
            }
        });
    }
}
