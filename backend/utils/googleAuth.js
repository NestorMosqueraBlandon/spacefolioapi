import { google } from "googleapis";

const googleConfig = {
    clientId: "566590860858-d81bgfoavgcb13e2laepv1ialomm6alb.apps.googleusercontent.com",
    clientSecret: "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",
    redirectUri: 'https://google.com'
}

const defaultScope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email',
];


const createConnection = () => {
    return new google.auth.OAuth2(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.redirectUri
    )
}

const getConnectionUrl = (auth) => {
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: defaultScope
    });
}

export const urlGoogle = () => {
    const auth = createConnection();
    const url = getConnectionUrl(auth);
    console.log(url)
    return url;
}

const getGooglePlusApi = async (auth) => {
    return google.plus({ version: 'v1', auth });
}

export const getGoogleAccountFromCode = async (code) => {

    const data = await auth.getToken(code);
    const tokens = data.tokens;

    const auth = createConnection();
    auth.setCredentials(tokens);

    const plus = getGooglePlusApi(auth);
    const me = await plus.people.get({ userId: 'me' });

    const userGoogleId = me.data.id;
    const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;

    return {
        id: userGoogleId,
        email: userGoogleEmail,
        tokens: tokens,
    };
}
