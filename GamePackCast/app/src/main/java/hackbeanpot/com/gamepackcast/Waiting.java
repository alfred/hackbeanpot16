package hackbeanpot.com.gamepackcast;

import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

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

        AdView adView = (AdView) findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder()
                //.addTestDevice("BE9C9EC7051FB80620465C0B0BC0FF53")
                .build();
        adView.loadAd(adRequest);
    }
}
