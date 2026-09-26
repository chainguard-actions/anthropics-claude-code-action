#!/bin/sh
# Fake claude executable that simulates an authentication failure
echo '{"type":"result","subtype":"error","error":{"type":"authentication_error","message":"Invalid API key"}}'
exit 1
