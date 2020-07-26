import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class PhoneMaskController extends Controller {
  @tracked
  phone;

  @action
  updatePhone(value) {
    this.phone = value;
  }
}
