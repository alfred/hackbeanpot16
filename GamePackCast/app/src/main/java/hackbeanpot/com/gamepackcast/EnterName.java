package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class EnterName extends MainActivity {
    private static final String TAG = EnterName.class.getSimpleName();
    private GoogleApiClient mApiClient;
    private HelloWorldChannel mHelloWorldChannel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.enter_name);

        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);

        Button button = (Button) findViewById(R.id.button);
        button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                EditText textbox = (EditText) findViewById(R.id.editText);
                sendMessage("NAME_ENTERED:" + textbox.getText().toString());
            }
        });
    }
}

