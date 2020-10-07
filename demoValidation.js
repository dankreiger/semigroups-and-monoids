// helper
const identity = x => x;

const List = list => ({
  foldMap: (f, empty) =>
    empty != null
      ? list.reduce((acc, x, i) => acc.concat(f(x, i)), empty)
      : list.map(f).reduce((acc, x) => acc.concat(x)),
});

// monoids
const Success = x => ({
  isFail: false,
  x,
  fold: (_, g) => g(x),
  concat: other => (other.isFail ? other : Success(x)),
});

const Fail = x => ({
  isFail: true,
  x,
  fold: (f, _) => f(x),
  concat: other => (other.isFail ? Fail(x.concat(other.x)) : Fail(x)),
});

const Validation = run => ({
  run,
  concat: other =>
    Validation((key, x) => run(key, x).concat(other.run(key, x))),
});

const isEmail = Validation((key, x) =>
  /@/.test(x) ? Success(x) : Fail([`${key} must be an email`])
);

const isPresent = Validation((key, x) =>
  !!x ? Success(x) : Fail([`${key} needs to be present`])
);

const validate = (spec, obj) =>
  List(Object.keys(spec)).foldMap(
    key => spec[key].run(key, obj[key]),
    Success([obj])
  );

const validations = { name: isPresent, email: isPresent.concat(isEmail) };

// no name / no email
const obj = { name: "", email: "" };
const res = validate(validations, obj);

console.assert(
  res.fold(identity).join("") ===
    [
      "name needs to be present",
      "email needs to be present",
      "email must be an email",
    ].join("")
);

// no email
const obj1 = { name: "dan", email: "" };
const res1 = validate(validations, obj1);

console.assert(
  res1.fold(identity, identity).join("") ===
    ["email needs to be present", "email must be an email"].join("")
);

res.fold(console.log, console.log);

// invalid email
const obj2 = { name: "dan", email: "dog" };
const res2 = validate(validations, obj2);

console.assert(
  res2.fold(identity, identity).join("") === ["email must be an email"].join("")
);

// valid
const obj3 = { name: "dan", email: "dog@woof.com" };
const res3 = validate(validations, obj3);

res3.fold(console.log, console.log);

console.assert(
  res3.fold(identity, identity).join("") ===
    [{ name: "dan", email: "dog@woof.com" }].join("")
);
