package hackbeanpot.com.gamepackcast;

import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.support.v4.view.MenuItemCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.MediaRouteActionProvider;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.InterstitialAd;
import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;

import java.io.IOException;

/**
 * Created by matcp_000 on 1/22/2016.
 */
public class MainActivity extends AppCompatActivity {
    private static final String TAG = MainActivity.class.getSimpleName();

    private static final int REQUEST_CODE = 1;

    private MediaRouter mMediaRouter;
    private MediaRouteSelector mMediaRouteSelector;
    private MediaRouter.Callback mMediaRouterCallback;
    private CastDevice mSelectedDevice;
    private GoogleApiClient mApiClient;
    private Cast.Listener mCastListener;
    private ConnectionCallbacks mConnectionCallbacks;
    private ConnectionFailedListener mConnectionFailedListener;
    private HelloWorldChannel mHelloWorldChannel;
    private boolean mApplicationStarted;
    private boolean mWaitingForReconnect;
    private String mSessionId;
    private InterstitialAd mInterstitialAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.splashscreen);

        ActionBar actionBar = getSupportActionBar();
        actionBar.setBackgroundDrawable(new ColorDrawable(
                getResources().getColor(android.R.color.transparent)));

        //Set up them ads

        mInterstitialAd = new InterstitialAd(this);
        mInterstitialAd.setAdUnitId(getString(R.string.interstitial_waiting));//"ca-app-pub-3940256099942544/1033173712");
        // Configure Cast device discovery
        mMediaRouter = MediaRouter.getInstance(getApplicationContext());
        mMediaRouteSelector = new MediaRouteSelector.Builder()
                .addControlCategory(CastMediaControlIntent.categoryForCast(getResources()
                        .getString(R.string.app_id))).build();
        mMediaRouterCallback = new MyMediaRouterCallback();

        AdView adView = (AdView) findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder()
                //.addTestDevice("BE9C9EC7051FB80620465C0B0BC0FF53")
                .build();
        adView.loadAd(adRequest);

    }

    @Override
    protected void onStart() {
        super.onStart();
        // Start media router discovery
        mMediaRouter.addCallback(mMediaRouteSelector, mMediaRouterCallback,
                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
    }

    @Override
    protected void onStop() {
        // End media router discovery
        mMediaRouter.removeCallback(mMediaRouterCallback);
        super.onStop();
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy");
        teardown(true);
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getMenuInflater().inflate(R.menu.menu, menu);
        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
        MediaRouteActionProvider mediaRouteActionProvider
                = (MediaRouteActionProvider) MenuItemCompat
                .getActionProvider(mediaRouteMenuItem);
        // Set the MediaRouteActionProvider selector for device discovery.
        mediaRouteActionProvider.setRouteSelector(mMediaRouteSelector);
        return true;
    }

    /**
     * Callback for MediaRouter events
     */
    private class MyMediaRouterCallback extends MediaRouter.Callback {

        @Override
        public void onRouteSelected(MediaRouter router, MediaRouter.RouteInfo info) {
            Log.d(TAG, "onRouteSelected");
            // Handle the user route selection.
            mSelectedDevice = CastDevice.getFromBundle(info.getExtras());

            launchReceiver();
        }

        @Override
        public void onRouteUnselected(MediaRouter router, MediaRouter.RouteInfo info) {
            Log.d(TAG, "onRouteUnselected: info=" + info);
            teardown(false);
            mSelectedDevice = null;
        }
    }

    /**
     * Start the receiver app
     */
    private void launchReceiver() {
        try {
            mCastListener = new Cast.Listener() {

                @Override
                public void onApplicationDisconnected(int errorCode) {
                    Log.d(TAG, "application has stopped");
                    teardown(true);
                }

            };
            // Connect to Google Play services
            mConnectionCallbacks = new ConnectionCallbacks();
            mConnectionFailedListener = new ConnectionFailedListener();
            Cast.CastOptions.Builder apiOptionsBuilder = Cast.CastOptions
                    .builder(mSelectedDevice, mCastListener);
            mApiClient = new GoogleApiClient.Builder(this)
                    .addApi(Cast.API, apiOptionsBuilder.build())
                    .addConnectionCallbacks(mConnectionCallbacks)
                    .addOnConnectionFailedListener(mConnectionFailedListener)
                    .build();
            ((MyApplication) this.getApplication()).setmApiClient(mApiClient);
            mApiClient.connect();
        } catch (Exception e) {
            Log.e(TAG, "Failed launchReceiver", e);
        }
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionCallbacks implements
            GoogleApiClient.ConnectionCallbacks {

        @Override
        public void onConnected(Bundle connectionHint) {
            Log.d(TAG, "onConnected");

            if (mApiClient == null) {
                // We got disconnected while this runnable was pending
                // execution.
                Log.e(TAG, "disconnected in onconnected");
                return;
            }

            try {
                if (mWaitingForReconnect) {
                    mWaitingForReconnect = false;

                    // Check if the receiver app is still running
                    if ((connectionHint != null)
                            && connectionHint.getBoolean(Cast.EXTRA_APP_NO_LONGER_RUNNING)) {
                        Log.d(TAG, "App  is no longer running");
                        teardown(true);
                    } else {
                        // Re-create the custom message channel
                        try {
                            Cast.CastApi.setMessageReceivedCallbacks(
                                    mApiClient,
                                    mHelloWorldChannel.getNamespace(),
                                    mHelloWorldChannel);
                        } catch (IOException e) {
                            Log.e(TAG, "Exception while creating channel", e);
                        }
                    }
                } else {
                    // Launch the receiver app
                    Cast.CastApi.launchApplication(mApiClient, getString(R.string.app_id), false)
                            .setResultCallback(
                                    new ResultCallback<Cast.ApplicationConnectionResult>() {
                                        @Override
                                        public void onResult(
                                                Cast.ApplicationConnectionResult result) {
                                            Status status = result.getStatus();
                                            Log.d(TAG,
                                                    "ApplicationConnectionResultCallback.onResult:"
                                                            + status.getStatusCode());
                                            if (status.isSuccess()) {
                                                ApplicationMetadata applicationMetadata = result
                                                        .getApplicationMetadata();
                                                mSessionId = result.getSessionId();
                                                String applicationStatus = result
                                                        .getApplicationStatus();
                                                boolean wasLaunched = result.getWasLaunched();
                                                Log.d(TAG, "application name: "
                                                        + applicationMetadata.getName()
                                                        + ", status: " + applicationStatus
                                                        + ", sessionId: " + mSessionId
                                                        + ", wasLaunched: " + wasLaunched);
                                                mApplicationStarted = true;

                                                // Create the custom message
                                                // channel
                                                mHelloWorldChannel = new HelloWorldChannel();
                                                setHelloWorldChannel(mHelloWorldChannel);
                                                Log.i(TAG, "hello world channel created");
                                                try {
                                                    Cast.CastApi.setMessageReceivedCallbacks(
                                                            mApiClient,
                                                            mHelloWorldChannel.getNamespace(),
                                                            mHelloWorldChannel);
                                                } catch (IOException e) {
                                                    Log.e(TAG, "Exception while creating channel",
                                                            e);
                                                }

                                                // set the initial instructions
                                                // on the receiver
                                                sendMessage(getString(R.string.instructions));
                                                Log.i(TAG, "initial message sent");
                                            } else {
                                                Log.e(TAG, "application could not launch");
                                                teardown(true);
                                            }
                                        }
                                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to launch application", e);
            }
        }

        @Override
        public void onConnectionSuspended(int cause) {
            Log.d(TAG, "onConnectionSuspended");
            mWaitingForReconnect = true;
        }
    }

    private void setHelloWorldChannel(HelloWorldChannel mHelloWorldChannel) {
        ((MyApplication) this.getApplication()).setmHelloWorldChannel(mHelloWorldChannel);
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionFailedListener implements
            GoogleApiClient.OnConnectionFailedListener {

        @Override
        public void onConnectionFailed(ConnectionResult result) {
            Log.e(TAG, "onConnectionFailed ");
            Log.e(TAG, "" + result.getErrorMessage());
            Log.e(TAG, "error code: " + result.getErrorCode());
            teardown(false);
        }
    }

    /**
     * Tear down the connection to the receiver
     */
    private void teardown(boolean selectDefaultRoute) {
        Log.d(TAG, "teardown");
        mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        mApplicationStarted = ((MyApplication) this.getApplication()).ismApplicationStarted();
        if (mApiClient != null) {
            Log.i(TAG, "api client exists");
            if (mApplicationStarted) {
                Log.i(TAG, "application started");
                if (mApiClient.isConnected() || mApiClient.isConnecting()) {
                    try {
                        Cast.CastApi.stopApplication(mApiClient, mSessionId);
                        Log.i(TAG, "sending disconnect");
                        if (mHelloWorldChannel != null) {
                            Cast.CastApi.removeMessageReceivedCallbacks(
                                    mApiClient,
                                    mHelloWorldChannel.getNamespace());
                            mHelloWorldChannel = null;
                        }
                    } catch (IOException e) {
                        Log.e(TAG, "Exception while removing channel", e);
                    }
                    mApiClient.disconnect();
                }
                mApplicationStarted = false;
            }
            mApiClient = null;
        }
        if (selectDefaultRoute) {
            mMediaRouter.selectRoute(mMediaRouter.getDefaultRoute());
        }
        mSelectedDevice = null;
        mWaitingForReconnect = false;
        mSessionId = null;
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
    }

    /**
     * Send a text message to the receiver
     */
     protected void sendMessage(String message) {
        if (mApiClient == null) {
            mApiClient = ((MyApplication) this.getApplication()).getmApiClient();
        }
        if (mHelloWorldChannel == null) {
            mHelloWorldChannel = ((MyApplication) this.getApplication()).getmHelloWorldChannel();
        }
        Log.i(TAG, "mApiClient: " + mApiClient + " mHelloWorldChannel: " + mHelloWorldChannel);
        if (mApiClient != null && mHelloWorldChannel != null) {
            try {
                Cast.CastApi.sendMessage(mApiClient,
                        mHelloWorldChannel.getNamespace(), message).setResultCallback(
                        new ResultCallback<Status>() {
                            @Override
                            public void onResult(Status result) {
//                                ApplicationMetadata applicationMetadata =
//                                        result.getApplicationMetadata();
//                                String sessionId = result.getSessionId();
//                                String applicationStatus = result.getApplicationStatus();
//                                boolean wasLaunched = result.getWasLaunched();

                                mApplicationStarted = true;
                                mHelloWorldChannel = new HelloWorldChannel();
                                try {
                                    Cast.CastApi.setMessageReceivedCallbacks(mApiClient,
                                            mHelloWorldChannel.getNamespace(),
                                            mHelloWorldChannel);
                                    Log.i(TAG, "msg sent");
                                } catch (IOException e) {
                                    Log.e(TAG, "Exception while creating channel", e);
                                }
                            }
                        });
                ((MyApplication) this.getApplication()).setmApplicationStarted(true);
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending message", e);
            }
        } else {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show();
        }
    }

    private void intentSwitcher(String message) {
        Log.i(TAG, "Intent switcher:" + message);
        //TODO dynamically chance text of buttons to player names
        if (message.equals("ENTER_NAME")) {
            Log.i(TAG, "switching to enter name");
            //this is the best place i can think to put this unfortunately
            ((MyApplication) this.getApplication()).setmApplicationStarted(true);
            Intent intent = new Intent(this, EnterName.class);
            startActivity(intent);
        }
        else if (message.equals("ENTER_NUM_PLAYERS")) {
            Log.i(TAG, "switching to enter num players");
            Intent intent = new Intent(this, NumPlayers.class);
            startActivity(intent);
        }
        else if (message.equals("ACTIVATE_START_BUTTON")) {
            Log.i(TAG, "switching to start button");
            Intent intent = new Intent(this, StartGame.class);
            startActivity(intent);
        }
        else if (message.equals("NAME_RECEIVED")) {
            Log.i(TAG, "switching to waiting for players");
            Intent intent = new Intent(this, Waiting.class);
            startActivity(intent);
        }
        else if (message.equals("GAME_HAS_STARTED")) {
            Log.i(TAG, "switching to PickCard");
            Intent intent = new Intent(this, PickCard.class);
            startActivity(intent);
        }
        else if (message.equals("PICK_CARD_SUCCESS")) {
            Log.i(TAG, "switching to HighLow");
            Intent intent = new Intent(this, HighLow.class);
            startActivity(intent);
        }
        else if (message.equals("HIGH_LOW_SUCCESS")) {
            Log.i(TAG, "switching to InsideOutside");
            Intent intent = new Intent(this, InsideOutside.class);
            startActivity(intent);
        }
        else if (message.equals("INSIDE_OUTSIDE_SUCCESS")) {
            Log.i(TAG, "switching to SmokeFire");
            Intent intent = new Intent(this, SmokeFire.class);
            startActivity(intent);
        }
        else if (message.equals("SMOKE_FIRE_SUCCESS")) {
            Log.i(TAG, "switching to PickPlayer");
            Intent intent = new Intent(this, PickPlayer.class);
            startActivity(intent);
        }
        /* TODO make a 2nd screen for failure/winning
        just using the "waiting for players..." screen atm */
        else if (message.equals("FAILURE") ||
                message.equals("PICK_PLAYER_SUCCESS")) {
            AdRequest adRequest = new AdRequest.Builder()
                    //.addTestDevice("BE9C9EC7051FB80620465C0B0BC0FF53")
                    .build();
            Log.i(TAG, "ad requested");
            mInterstitialAd.loadAd(adRequest);
            mInterstitialAd.setAdListener(new AdListener(){
                public void onAdLoaded(){
                    if (mInterstitialAd.isLoaded()) {
                        Log.i(TAG, "attempting to show ad");
                        mInterstitialAd.show();
                    } else {
                        Log.e(TAG, "Ad did not load");
                    }
                }
            });
            Log.i(TAG, "switching to failure screen");
            Intent intent = new Intent(this, Waiting.class);
            startActivity(intent);
        }
        else if (message.equals("MAX_PLAYERS_REACHED")) {
            Toast.makeText(MainActivity.this, "Maximum Players Reached", Toast.LENGTH_LONG).show();
        }
        else if (message.equals("INVALID_PLAYER_CHOICE")) {
            Toast.makeText(MainActivity.this, "Invalid player choice. Pick someone else.", Toast.LENGTH_LONG).show();
        }
    }

    /**
     * Custom message channel
     */
    class HelloWorldChannel implements Cast.MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.namespace);
        }

        /*
         * Receive message from the receiver app
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                                      String message) {
            Log.d(TAG, "onMessageReceived: " + message);
            intentSwitcher(message);
        }

        private void sendMessage(String message) {
            if (mApiClient != null && mHelloWorldChannel != null) {
                try {
                    Cast.CastApi.sendMessage(mApiClient, mHelloWorldChannel.getNamespace(), message)
                            .setResultCallback(
                                    new ResultCallback<Status>() {
                                        @Override
                                        public void onResult(Status result) {
                                            if (!result.isSuccess()) {
                                                Log.e(TAG, "Sending message failed");
                                            }
                                        }
                                    });
                } catch (Exception e) {
                    Log.e(TAG, "Exception while sending message", e);
                }
            }
        }
    }
}

